'use strict'

import { app, protocol, BrowserWindow, ipcMain, Notification, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// import registerBackgroundEvents from './events/background'
const path = require('path');
const mysql = require('mysql');
const fs = require('fs');
const { promisify } = require('util');

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
   { scheme: 'app', privileges: { secure: true, standard: true } }
]);

let mainWindow; // To point created main app object.

async function createWindow() {
   // Detect user's screen size.
   const primaryScreen = screen.getPrimaryDisplay();
   const workArea = primaryScreen.workArea;
   // const width = workArea.width - workArea.x;
   // const height = workArea.height - workArea.y;
   // const allScreens = screen.getAllDisplays();
   // console.info({ primaryScreen });


   // Create the browser window.
   const win = new BrowserWindow({
      // width,
      // height,
      // fullscreen: true,
      webPreferences: {
         preload: path.join(__dirname, 'preload.js'),

         // Use pluginOptions.nodeIntegration, leave this alone
         // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
         nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
         contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      }
   })

   if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
      if (!process.env.IS_TEST) win.webContents.openDevTools()
      return win;
   } else {
      createProtocol('app')
      // Load the index.html when not in development
      win.loadURL('app://./index.html')
      return win;
   }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
   // On macOS it is common for applications and their menu bar
   // to stay active until the user quits explicitly with Cmd + Q
   if (process.platform !== 'darwin') {
      app.quit()
   }
})

app.on('activate', () => {
   // On macOS it's common to re-create a window in the app when the
   // dock icon is clicked and there are no other windows open.
   if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
   if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
         await installExtension(VUEJS_DEVTOOLS)
      } catch (e) {
         console.error('Vue Devtools failed to install:', e.toString())
      }
   }


   const CERT_DIR = path.resolve('src', 'ssl');
   const OPTIONS = {
      multipleStatements: true,
      timezone: 'Z',
      dateStrings: true,
      debug: false,
      connectionLimit: 20,
      ssl: {
         rejectUnauthorized: false,
         ca: fs.readFileSync(path.join(CERT_DIR, 'localhost-certificate.pem')),
         key: fs.readFileSync(path.join(CERT_DIR, 'localhost-key.pem'))
      }
   };

   const QUERIES = {
      getMysqlVersion: (title) => {
         if (title) {
            title = JSON.stringify(title);
            const query = /*SQL*/`
               SELECT 
                  VERSION() AS 'version',
                  \'${title}\' AS '__title'
               ;
            `;
            return query;
         }
         const query = /*SQL*/` 
            SELECT 
               VERSION() AS 'version'
            ;
         `;
         return query;
      },
      getMysqlTimezones: (title) => {
         const query = /*SQL*/`
            SELECT 
               @@SYSTEM_TIME_ZONE AS 'SYSTEM_TIME_ZONE',
               @@GLOBAL.TIME_ZONE AS 'GLOBAL_TIME_ZONE',
               @@SESSION.TIME_ZONE AS 'SESSION_TIME_ZONE'
               ${title ? `, \'${title}\' AS '__title'` : ''}
            ;
         `;
         return query;
      },
      getAllSchemas: () => {
         const query = /*SQL*/`
            SHOW 
               DATABASES
            WHERE
               \`database\` NOT LIKE '%schema%'
               AND 
               \`database\` NOT LIKE '%phpmyadmin%'
               AND
               \`database\` != 'mysql'
            ;
         `;
         return query;
      },
      getAllTablesInfo: (title, schema) => {
         // schema = JSON.stringify(schema);
         const query = /*SQL*/`
            SELECT 
               *,
               \'${title}\' AS '__title'
            FROM 
               INFORMATION_SCHEMA.TABLES
            WHERE 
               TABLE_SCHEMA = \'${schema}\'
            ;
         `;
         return query;
      },
      getTableSchema: (table, schema) => {
         if (!table) throw new Error('No table name.');
         // schema = JSON.stringify(schema);
         // table = JSON.stringify(table);
         const query = /*SQL*/`
            DESCRIBE
               \`${schema}\`.\`${table}\`
            ;
         `;
         return query;
      },
      getCreateTableQuery: (table, schema) => {
         const query = /*SQL*/`
            SHOW CREATE TABLE \`${schema}\`.\`${table}\`
         `;
         return query;
      },
      getTableColumnNames: (table, schema, title) => {
         // table = JSON.stringify(table);
         // schema = JSON.stringify(schema);
         const query = /*SQL*/`
            SELECT
               COLUMN_NAME,
               \'${table}\' AS '__table'
               ${title ? `, \'${title}\' AS '__title'` : ''}
            FROM
               INFORMATION_SCHEMA.COLUMNS
            WHERE
               TABLE_NAME = \'${table}\'
               AND
               TABLE_SCHEMA = \'${schema}\'
         ;
         `;
         return query;
      },
   }

   let WEB_PROD_POOL; // Default conn to check user login.

   const CONNS_FILTERS = ['title', 'host', 'port', 'user', 'database', 'timezone', 'all_schemas', 'mysql_version', 'system_time_zone', 'global_time_zone', 'session_time_zone'];

   let POOLS = {}; // Actual created pools.
   let CONNS = {}; // Filtered values from POOLS var to show to user (more gets trimmed in vue to show on a table UI).
   let SCHEMA; // Selected and confirmed schema name
   let SCHEMAS = {}; // Confirmd schemas per connection.

   const registerBackgroundEvents = () => {

      //## CLIENT::init ##//
      ipcMain.handle("CLIENT::init", async (event, payload) => {
         const result = await endExistingPoolsAndConns(); // Set CONNS and POOLS to {} and set WEB_PROD_POOL to null.
         return result;
      });

      //## CLIENT::user-login-avail ##//
      ipcMain.handle("CLIENT::user-login-avail", async (event, payload) => {
         console.log('CLIENT::user-login-avail', payload);
         const result = await checkLoginAvail(); // Set WEB_PROD_POOL.
         console.log(result);
         return result;
      });

      //## CLIENT::init-conn ##//
      ipcMain.handle("CLIENT::init-conn", async (event, payload) => {
         const { host, user, password, port, title } = payload;

         try {
            if (!host || !user || !title) {
               return {
                  status: false,
                  msg: "Missing connection credentials",
               }
            }
            if (CONNS[title]) {
               return {
                  status: false,
                  msg: "Title should be unique",
               }
            }

            const pool = await mysql.createPool({
               ...OPTIONS,
               host,
               user,
               password,
               port,
            });

            const poolConfig = (() => {
               if (!pool) return;
               if (!pool.config) return;
               if (!pool.config.connectionConfig) return;
               return pool.config.connectionConfig;
            })();
            if (!poolConfig) return { status: false, msg: "Invalid pool object" }

            await endExistingPoolsAndConns(title); // Terminate existing POOL[title] and CONNS[title].

            CONNS[title] = poolConfig;
            POOLS[title] = pool;

            // const query = promisify(pool.query).bind(pool);
            const query = promisify(POOLS[title].query).bind(POOLS[title]);
            const allSchemas = await query(QUERIES.getAllSchemas());
            const mysqlVersion = await query(QUERIES.getMysqlVersion());
            const mysqlTimezones = await query(QUERIES.getMysqlTimezones());

            const schemaNames = [];
            allSchemas.forEach(obj => {
               const schema = Object.values(obj);
               schemaNames.push(schema[0]);
            });

            CONNS[title].title = title;
            CONNS[title].all_schemas = schemaNames;
            CONNS[title].mysql_version = mysqlVersion[0].version;
            CONNS[title].system_time_zone = mysqlTimezones[0].SYSTEM_TIME_ZONE;
            CONNS[title].global_time_zone = mysqlTimezones[0].GLOBAL_TIME_ZONE;
            CONNS[title].session_time_zone = mysqlTimezones[0].SESSION_TIME_ZONE;

            return {
               status: true,
               msg: "success",
            };

         } catch (error) {
            console.error(error);
            endExistingPoolsAndConns(title)
            return { status: false, msg: error };
         }
      });

      //## CLIENT::get-conns ##//
      ipcMain.handle("CLIENT::get-conns", async (event, payload) => {

         //@@ If no title payload @@//
         if (!payload || !payload.title) {
            const data = {};
            for (const title in CONNS) {
               const pool = CONNS[title];
               if (!data[title]) data[title] = {};

               CONNS_FILTERS.forEach(prop => {
                  data[title][prop] = pool[prop];
               });
            }

            return {
               status: true,
               msg: 'Retrived all existing connections',
               data,
            }
         }

         //@@ If title payload @@//
         const conn = CONNS[title];
         if (!conn) {
            console.error('no conn');
            return { status: false, msg: `No pool exists for ${title}` }
         }
         const data = {
            [title]: [],
         };
         CONNS_FILTERS.forEach(prop => {
            data[title][prop] = pool[prop];
         });

         return {
            status: true,
            msg: 'success',
            data,
         };
      });

      //## CLIENT::schema-confirmed ##//
      ipcMain.handle("CLIENT::schema-confirmed", async (event, payload) => {
         if (!payload) {
            const msg = `Invalid payload`;
            console.error(msg);
            return { status: false, msg };
         }

         // const schemaName = payload.schema;

         // if (SCHEMA === schemaName) {
         //    return { status: true, msg: `Same schema` }
         // }
         // SCHEMA = schemaName;

         // return { status: true, msg: `Comparing database schmea was changed to ${SCHEMA}` }

         const schemas = payload;

         for (const title in schemas) {
            SCHEMAS[title] = schemas[title];
         }

         return { status: true, msg: `new SCHEMAS obj: ${JSON.stringify(SCHEMAS)}` };
      });

      //## CLIENT::get-tables-info ##//
      ipcMain.handle("CLIENT::get-tables-info", async (event, payload) => {
         try {
            // const schema = SCHEMA || (!payload ? null : payload.schema ? payload.schema : payload.database);
            // if (!schema) {
            //    return {
            //       status: false,
            //       msg: 'No schema selected',
            //    }
            // }

            if (!POOLS || Object.keys(POOLS).length < 1) {
               const msg = `Something very wrong!`;
               return { status: false, msg };
            }

            const webCont = mainWindow.webContents;

            console.log({ mainWindow, webCont });

            webCont.send("BACKG::progress", {
               msg: 'Initializing..'
            });

            let title;

            const asyncGen = {
               async*[Symbol.asyncIterator]() {
                  if (!title) throw new Error('wtf');
                  const pool = POOLS[title];
                  const query = promisify(pool.query).bind(pool);

                  webCont.send("BACKG::progress", {
                     msg: `Fetching tables in ${title}`,
                  });

                  const schema = SCHEMAS[title]

                  const tablesInfos = await query(QUERIES.getAllTablesInfo(title, schema));

                  //>> WORKING CODE <<//
                  // const promiseAll = [];
                  // tablesInfos.forEach(tableInfo => {
                  //    const { TABLE_NAME, TABLE_SCHEMA } = tableInfo;
                  //    const promise = query(QUERIES.getTableColumnNames(TABLE_NAME, TABLE_SCHEMA, title));
                  //    promiseAll.push(promise);
                  // });
                  // const allColumns = await Promise.all(promiseAll);
                  // yield allColumns

                  //>> WORKING CODE <<//
                  const tables = [];
                  for (const tableInfo of tablesInfos) {
                     const { TABLE_NAME, TABLE_SCHEMA } = tableInfo;

                     webCont.send("BACKG::progress", {
                        msg: `Checking ${TABLE_NAME}`
                     });


                     const columns = await query(QUERIES.getTableColumnNames(TABLE_NAME, TABLE_SCHEMA));
                     const cols = columns.map(c => c.COLUMN_NAME);

                     const create = await query(QUERIES.getCreateTableQuery(TABLE_NAME, TABLE_SCHEMA));

                     const createQuery = create[0]['Create Table'];
                     const createQueryFormat = createQuery.replace('CREATE TABLE ', `CREATE TABLE IF NOT EXISTS ${schema}.`);

                     tables.push({
                        ...tableInfo,
                        __title: title,
                        __columns: cols,
                        __columns_count: cols.length,
                        __create_query: createQueryFormat,
                     });
                  }
                  yield tables;

               }
            };

            for (const title in POOLS) {
               const pools = POOLS[title];
               pools
            }

            webCont.send("BACKG::progress", {
               msg: `Collecting data`
            });

            const final = {};
            for (const titl in POOLS) {
               title = titl;
               for await (let tables of asyncGen) {
                  tables.forEach(table => {
                     const title = table.__title;
                     if (!final[title]) final[title] = [];

                     final[title].push(table);
                  });
               }
            };

            webCont.send("BACKG::progress", {
               msg: `Done`,
            });

            //>> WORKING CODE <<//
            // const promiseAll = [];
            // for (const title in POOLS) {
            //    const pool = POOLS[title];
            //    const query = promisify(pool.query).bind(pool);
            //    const promise = query(QUERIES.getAllTablesInfo(title, schema));
            //    promiseAll.push(promise);
            // }
            // const result = await Promise.all(promiseAll);



            //>> WORKING CODE <<//
            // const final = {};
            // result.forEach(arr => {
            // arr.forEach(obj => {
            //    const title = obj.__title;
            //    if (!final[title]) {
            //       final[title] = [];
            //    }
            //    final[title].push(obj);
            // });
            // });

            const doneDelay = () => {
               const delayTime = 1000;
               webCont.send("BACKG::progress", {
                  msg: 'Done',
                  // close_in: delayTime,
               });
               return new Promise(res => {
                  setTimeout(() => {
                     res(true);
                  }, delayTime);
               });
            }

            await doneDelay();

            webCont.send("BACKG::progress");

            return {
               status: true,
               msg: `Retrieved data`,
               data: final,
            }

         } catch (error) {
            console.error(error);
            return { status: false, msg: error };
         } finally {
            mainWindow.webContents.send("BACKG::progress", {
               msg: `Done`,
               close_in: 1000,
            });
         }
      });

      //## CLIENT::get-columns ##//
      // ipcMain.handle("CLIENT::get-columns", async (event, payload) => {
      //    try {
      //       // const schema = SCHEMA || (!payload ? null : payload.schema ? payload.schema : payload.database);
      //       // if (!schema) {
      //       //    return {
      //       //       status: false,
      //       //       msg: 'No schema selected',
      //       //    }
      //       // }

      //       if (!POOLS || Object.keys(POOLS).length < 1) {
      //          const msg = `Something very wrong!`;
      //          console.error(msg);
      //          return { status: false, msg };
      //       }

      //       const promiseAll = [];

      //       for (const title in POOLS) {
      //          const pool = POOLS[title];
      //          const query = promisify(pool.query).bind(pool);
      //          const promise = query(QUERIES.getTableColumnNames(title, schema));
      //          promiseAll.push(promise);
      //       }

      //       const result = await Promise.all(promiseAll);

      //       const final = {};
      //       result.forEach(arr => {
      //          arr.forEach(obj => {
      //             const title = obj.__title;
      //             if (!final[title]) {
      //                final[title] = [];
      //             }
      //             final[title].push(obj);
      //          });
      //       });

      //       return {
      //          status: true,
      //          msg: `Retrieved data`,
      //          data: final,
      //       }

      //    } catch (error) {
      //       console.error(error);
      //       return { status: false, msg: error };
      //    }
      // });

      //## CLIENT::compare-all ##//
      // ipcMain.handle("CLIENT::compare-all", async (event, payload) => {
      //    // const schema = SCHEMA || (!payload ? null : payload.schema ? payload.schema : payload.database);

      //    // if (!schema) {
      //    //    return {
      //    //       status: false,
      //    //       msg: 'No schema selected',
      //    //    }
      //    // }

      //    const {
      //       getAllTablesInfo,
      //    } = QUERIES;

      //    try {

      //       const tablesInfoPromises = [];

      //       for (const title in CONNS) {
      //          // const conn = CONNS[title];
      //          // const pool = mysql.createPool({
      //          //    ...OPTIONS,
      //          //    host: conn.host,
      //          //    user: conn.user,
      //          //    password: conn.password,
      //          // });
      //          const pool = POOLS[title];
      //          const query = promisify(pool.query).bind(pool);
      //          const promise = query(getAllTablesInfo(title, schema));
      //          tablesInfoPromises.push(promise);
      //       }

      //       const queryResult = await Promise.all(tablesInfoPromises);

      //       return {
      //          status: true,
      //          data: queryResult,
      //          msg: "Retrieved data"
      //       }
      //    } catch (error) {
      //       console.error(error);
      //       return {
      //          status: false,
      //          msg: error,
      //       }
      //    }
      // });

      //## CLIENT::notification ##//
      ipcMain.on("CLIENT::notification", (event, payload) => {
         new Notification({
            title: payload.title,
            body: payload.body,
         }).show();
      });

      //## CLIENT::schema-reset ##//
      ipcMain.handle("CLIENT::schema-reset", (event, payload) => {
         // SCHEMA = null;
         SCHEMAS = {};
         return {
            status: true,
            msg: "Reset schema"
         }
      });

   };

   function endExistingPoolsAndConns(title) {
      return new Promise(async (res, rej) => {
         try {
            if (Object.keys(POOLS).length < 1) {
               POOLS = {};
               CONNS = {};
               res(true);
               return;
            }

            // Clear all existing.
            if (!title) {
               const pools = Object.values(POOLS);
               const ends = [];

               if (WEB_PROD_POOL) {
                  const promise = promisify(WEB_PROD_POOL.end).bind(WEB_PROD_POOL);
                  ends.push(promise());
               }

               pools.forEach(pool => {
                  const promise = promisify(pool.end).bind(pool);
                  ends.push(promise());
               });

               await Promise.all(ends);
               POOLS = {};
               CONNS = {};
               // SCHEMA = null;
               SCHEMAS = {};
               WEB_PROD_POOL = null;
               mainWindow.webContents.send("BACKG::schema-confirmed", SCHEMAS);
               res(true);
               return;
            }

            let end = () => null; // To avoid using block scope if statement.

            // Clear specific one.
            const existingPool = POOLS[title];
            if (existingPool) {
               end = promisify(existingPool.end).bind(existingPool);
            }
            await end();
            delete POOLS[title];
            delete CONNS[title];
            // SCHEMA = null;
            delete SCHEMAS[title];
            mainWindow.webContents.send("BACKG::schema-confirmed", SCHEMAS);
            res(true);
         } catch (error) {
            rej(error);
            console.error(error);
         }
      });
   };

   function webProdConnDefault() {
      const WEB_PROD_CONN_CRED = {
         ...OPTIONS,
         host: "172.16.23.15",
         user: "ijbcp",
         password: "thdwndudTHDWNDUD123!@#",
      };
      return new Promise(async (resolve, reject) => {
         WEB_PROD_POOL = await mysql.createPool(WEB_PROD_CONN_CRED);

         WEB_PROD_POOL.query(/*SQL*/`SELECT 'test' AS 'testing';`, (error, results, fields) => {
            if (error) return reject({ status: false, msg: error.sqlMessage });
            resolve({ status: true, msg: 'success', pool: WEB_PROD_POOL });
         });
      });
   };

   function checkLoginAvail() {
      return new Promise(async (resolve, reject) => {
         if (!mainWindow || !mainWindow.webContents) {
            const errmsg = (!mainWindow) ? `No mainWindow...???` : `mainWindow exists but no webContents..???`;
            console.error(errmsg);
            const result = { status: false, msg: errmsg }
            // reject(result);
            resolve(result);
            return;
         }

         const webCont = mainWindow.webContents;
         let check;

         try {
            check = await webProdConnDefault();
            if (!check.status) {
               console.error(check.msg);
               // const result = { status: check.status, msg: check.msg };
               // webCont.send("BACKG::user-login-avail", result);
               // resolve(result);
               // return result;
            }

            const result = { status: check.status, msg: check.msg };
            // webCont.send("BACKG::user-login-avail", result);

            // check.status ? resolve(result) : reject(result);
            resolve(result);

            return check;
         } catch (error) {
            console.error(error.msg);
            // webCont.send("BACKG::user-login-avail", error);
            // reject(error);
            resolve(error);
         }
      });
   };

   registerBackgroundEvents();
   mainWindow = await createWindow();
   mainWindow.fullScreen = false;
   mainWindow.maximize();

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
   if (process.platform === 'win32') {
      process.on('message', (data) => {
         if (data === 'graceful-exit') {
            app.quit()
         }
      })
   } else {
      process.on('SIGTERM', () => {
         app.quit()
      })
   }
}
