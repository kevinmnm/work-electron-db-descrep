import { ipcMain } from "electron";
const mysql = require("mysql");
const { promisify } = require("util");

const CONNS = {};

const registerBackgroundEvents = () => {
  ipcMain.handle("CLIENT::init-conn", async (event, payload) => {
    console.log(event);
    try {
      const { host, username, password, port } = payload;
      const pool = await mysql.createPool({
        host,
        user: username,
        password,
        port,
      });
      cache.push(pool);
      return {
        status: true,
        msg: "success",
      };
    } catch (error) {
      console.error(error);
      return { status: false, msg: error };
    }
  });

  ipcMain.handle("CLIENT::get-conns", async (event, payload) => {
    return cache;
  });
};

export default registerBackgroundEvents;
