export default {
   state: {
      tables_info: null, // {<title>: [{}, {},], <title>: [{}, {},]}.
      fetching_tables: false,
      missing_tables: null, // {<title>: [<table name>, <table name>,], <title>: [<table name>, <table name>,]}
      // missing_columns: null, // {<title>: {<table name>: [<column name>,], <table name>}: [<column name>,],}
      missing_columns: null, // [{ column: '', table: '' }, ]
   },

   // getters: {
   //    compared_state() {

   //    },
   // },

   mutations: {
      TABLES_INFO(state, payload) {
         state.tables_info = payload;
      },
      FETCHING_TABLES(state, payload) {
         state.fetching_tables = payload;
      },
      MISSING_TABLES(state, payload) {
         state.missing_tables = payload;
      },
      MISSING_COLUMNS(state, payload) {
         state.missing_columns = payload;
      },
   },

   actions: {
      async getSchemasInfo({ rootState, commit, dispatch }) {
         commit('FETCHING_TABLES', true);

         const schema = rootState.schema_confirmed;
         if (!schema) {
            const errmsg = `No selected schema`;
            commit('FETCHING_TABLES', false);
            commit('SCHEMA_SELECTED', null);
            commit('SCHEMA_CONFIRMED', null);
            return {
               status: false,
               msg: errmsg,
            }
         }

         const result = await window.electronAPI["CLIENT::get-tables-info"]();

         console.warn({ result });

         if (!result || !result.status || !result.data) {
            commit('FETCHING_TABLES', false);
            commit('SCHEMA_CONFIRMED', null);
            console.error(result.msg);
            return result;
         }

         const data = result.data;

         // const formatData = {
         //    ...data,
         // }

         // for (const title in data) {
         //    const infos = data[title]; // Array.
         //    formatData[title].tables_count = infos.length;

         //    infos.forEach( info => {

         //    });
         // }

         commit('TABLES_INFO', data);

         await dispatch('detectMissingTables');

         commit('FETCHING_TABLES', false);

         return result;
      },
      async detectMissingTables({ rootState, state, commit, dispatch }) {
         rootState; dispatch;
         const tablesInfo = state.tables_info;
         // const schemaConfirmed = rootState.schema_confirmed;
         const entries = Object.entries(tablesInfo);

         const totalSchemasCount = entries.length;

         const missings = {};

         entries.forEach((conn, index) => {
            const title = conn[0];
            const tables = conn[1];

            // const allTables = tables.map( table => table.TABLE_NAME);

            if (!missings[title]) missings[title] = [];


            tables.forEach((table) => {
               const tableName = table.TABLE_NAME;

               for (let i = 0; i < totalSchemasCount; i++) {
                  if (index !== i) { // Skip self.
                     const otherConn = entries[i];
                     const otherConnTitle = otherConn[0];
                     const otherConnTables = otherConn[1];

                     let hasSameTableName = false;
                     // let createQuery;
                     let existsIn = '';
                     for (let k = 0; k < otherConnTables.length; k++) {
                        const otherTable = otherConnTables[k];
                        const otherTableName = otherTable.TABLE_NAME;
                        if (tableName === otherTableName) {
                           hasSameTableName = true;
                           existsIn = '';
                           // createQuery = '';
                           break;
                        } else {
                           // createQuery = /*SQL*/`
                           //    SHOW CREATE TABLE ${schemaConfirmed}.${otherTableName};
                           // `.trim();
                           existsIn = otherConnTitle;
                        }
                     }

                     if (!hasSameTableName) {
                        if (!missings[title]) {
                           missings[title] = [];
                        }

                        missings[title].push({ name: tableName, exists_in: existsIn, create_query: table.__create_query });
                     }
                  }
               }

            });
         });

         commit('MISSING_TABLES', missings);

         await dispatch('detectColumnDiscrep');

         return { status: true, msg: `Checked missing tables` };
      },
      async detectColumnDiscrep({ rootState, state, commit }) {
         const schema = rootState.schema_confirmed;
         if (!schema) {
            const errmsg = `No selected schema`;
            commit('FETCHING_TABLES', false);
            commit('SCHEMA_SELECTED', null);
            commit('SCHEMA_CONFIRMED', null);
            return {
               status: false,
               msg: errmsg,
            }
         }

         const tablesInfo = state.tables_info;
         const connsEntr = Object.entries(tablesInfo);
         const connsCount = connsEntr.length;

         // const final = {};
         const final = [];

         for (const title in tablesInfo) {
            const tables = tablesInfo[title];
            tables.forEach((table) => {
               const tableName = table.TABLE_NAME;
               const columns = table.__columns;
               // const createQuery = table.__create_query;
               const title = table.__title;

               if (!table.__missing_columns) table.__missing_columns = [];


               for (let i = 0; i < connsCount; i++) {
                  const otherConnEntr = connsEntr[i];
                  const otherConnTitle = otherConnEntr[0];
                  if (otherConnTitle !== title) {
                     const otherConnTables = otherConnEntr[1];

                     for (let k = 0; k < otherConnTables.length; k++) {
                        const otherConnTable = otherConnTables[k];
                        const otherConnTableName = otherConnTable.TABLE_NAME;

                        if (otherConnTableName === tableName) {
                           const otherColumns = otherConnTable.__columns;

                           for (let m = 0; m < otherColumns.length; m++) {
                              const otherCol = otherColumns[m];

                              //@@ If any of other title tables columns does not also have the one being compared to @@//
                              if (!columns.includes(otherCol)) {
                                 console.warn(`Missing Column Found In \n[TITLE]: ${title} \n[TABLE]: ${tableName} \n[COLUMN]: ${otherCol}`);

                                 table.__missing_columns.push(otherCol);

                                 // if (!final[title][tableName]) final[title][tableName] = {};

                                 // final[title][tableName].table = tableName;
                                 // final[title][tableName].column = otherCol;

                                 if (!final[title]) final[title] = [];

                                 final[title].push({
                                    table: tableName,
                                    column: otherCol,
                                 });
                              }
                           }
                        }
                     }
                  }
               }
            });
         }

         commit('MISSING_COLUMNS', final);
         return { status: true, msg: `Checked missing columns per table` }
      },
   }
};