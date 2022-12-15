// @ts-nocheck
/**
 * File that connects between client (browser window) and worker (background.js).
 **/
import { contextBridge, ipcRenderer } from "electron";
const path = require("path");
const fs = require("fs");

contextBridge.exposeInMainWorld("electronAPI", {

   //## FROM CLIENT ##//

   "CLIENT::init": async (payload) => {
      const result = await ipcRenderer.invoke("CLIENT::init", payload);
      return result;
   },

   "CLIENT::init-conn": async (payload) => {
      const result = await ipcRenderer.invoke("CLIENT::init-conn", payload);
      return result;
   },

   "CLIENT::get-conns": async () => {
      const result = await ipcRenderer.invoke("CLIENT::get-conns");
      return result;
   },

   "CLIENT::schema-confirmed": async (payload) => {
      const result = await ipcRenderer.invoke("CLIENT::schema-confirmed", payload);
      return result;
   },

   "CLIENT::compare-all": async () => {
      const result = await ipcRenderer.invoke("CLIENT::compare-all");
      return result;
   },

   "CLIENT::get-tables-info": async () => {
      const result = await ipcRenderer.invoke("CLIENT::get-tables-info");
      return result;
   },

   "CLIENT::get-columns": async (payload) => {
      const result = await ipcRenderer.invoke("CLIENT::get-columns", payload);
      return result;
   },

   "CLIENT::schema-reset": async (payload) => {
      const result = await ipcRenderer.invoke("CLIENT::schema-reset", payload);
      return result;
   },

   "CLIENT::notification": (payload) => {
      ipcRenderer.send("CLIENT::notification", payload);
   },

   //## FROM BACKG ##//

   "BACKG::schema-confirmed": async callback => {
      ipcRenderer.on("BACKG::schema-confirmed", callback);
   },

   "BACKG::progress": async callback => {
      ipcRenderer.on("BACKG::progress", callback);
   },
});
