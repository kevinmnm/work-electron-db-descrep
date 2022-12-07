// @ts-nocheck
/**
 * File that connects between client (browser window) and worker (background.js).
 **/
import { contextBridge, ipcRenderer } from "electron";
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {

  "CLIENT::init-conn": async (payload) => {
    const result = await ipcRenderer.invoke("CLIENT::init-conn", payload);
    return result;
  },

  "CLIENT::get-conns": async () => {
   const result = await ipcRenderer.invoke("CLIENT::get-conns");
   return result;
  },

});
