import Vue from "vue";
import Vuex from "vuex";
import vuetify from "../plugins/vuetify.js";
// Modules //
import rules from "./modules/rules.js";
import results from "./modules/results.js";
import progress from "./modules/progress.js";
import panels from "./modules/panels.js";
import dev from "./modules/dev.js";

const isDev = process.env.NODE_ENV === 'development';
console.warn({ isDev });

Vue.use(Vuex);

export default new Vuex.Store({
   state: {
      conn_min: 2, // Minimun DB connection required for comparison (static value).
      conn_limit: 2, // How many DB connection allowed for the app (static value).
      conn_table_filter: ['host', 'port', 'user', 'mysql_version', 'system_time_zone', 'global_time_zone', 'session_time_zone'], // Filter to show on table UI (static value) and must be included in CONNS_FILTERS variable.
      conns: {}, // {<title>: {...}}
      // schema_synced: [],
      schema_selected: {}, // {<title>: '', <title>: ''}
      schema_confirmed: null, // {<title>: '', <title>: ''}
      conn_fetching: false,
      fetching: false, // Whole app loading.
   },
   getters: {
      /**
       * Number of connections are equal to minimum connection required to run the app (conn_min).
      **/
      ready_state(state) {
         const connMin = state.conn_min;
         const connsCount = Object.values(state.conns).length;

         return (connsCount >= connMin);
      },
      /**
       * Array.
       * Get schemas that exists in all connections.
      **/
      comparable_schemas(state, getters) {
         const ready = getters.ready_state;
         if (!ready) return [];
         const connsArr = Object.values(state.conns);
         const schemasColl = connsArr.map(connObj => {
            const schemaArr = connObj.all_schemas;
            return schemaArr;
         }); // [ [..], [..], [..] ]

         let comparables = schemasColl[0]; // Set to first array to start with.
         console.log({ comparables });

         schemasColl.forEach((otherArr, index) => {
            if (index === 0) return; // Skip first array which was set to default comparables.
            comparables = comparables.filter(item => { // Trim out items from comparables if other array does not have same item.
               return otherArr.includes(item);
            });
         });

         return comparables;
      },
      comparable_state(state, getters) {
         const readyState = getters.ready_state;
         const schemaSelected = state.schema_selected;
         const schemaConfirmed = state.schema_confirmed;
         return !!(readyState && schemaSelected && schemaConfirmed);
      },
      /**
       * The getters.comparable_state is true and state.results.tables_info has value.
      **/
      compared_state(state, getters, rootState) {
         const comparableState = getters.comparable_state;
         if (!comparableState) return false;
         const tablesInfo = rootState.results.tables_info;
         const isObject = typeof (tablesInfo) === 'object' && !Array.isArray(tablesInfo) && tablesInfo !== null;
         if (!isObject) return false;
         const infoArr = Object.keys(tablesInfo);
         const connMin = state.conn_min;

         return infoArr.length >= connMin;
      },
      is_mobile() {
         const mobile = vuetify.framework.breakpoint.mobile;
         return mobile;
      },
   },
   mutations: {
      CONNS(state, payload) {
         state.conns = payload;
      },
      SECHEMA_SYNCED(state, payload) {
         state.schema_synced = payload;
      },
      SCHEMA_SELECTED(state, payload) {
         // state.schema_selected = payload;
         if (!payload) {
            const schemaSelected = state.schema_selected;
            if (Object.keys(schemaSelected).length < 1) {
               state.schema_selected = {};
               return;
            }
            for (const title in schemaSelected) {
               state.schema_selected[title] = null;
            }
            return;
         }
         const { title, value } = payload;
         console.warn({ title, value });
         state.schema_selected[title] = value;
      },
      SCHEMA_CONFIRMED(state, payload) {
         state.schema_confirmed = payload;
      },
      CONN_FETCHING(state, payload) {
         state.conn_fetching = payload;
      },
      FETCHING(state, payload) {
         state.fetching = payload;
      },
   },
   actions: {
      async updateConns({ commit }) {
         const conns = await window.electronAPI["CLIENT::get-conns"]();
         if (!conns.status) {
            return { status: false }
         }
         commit('CONNS', conns.data);
         return { status: true, msg: `Retrieved CONNS`, }
      },
      async schemaConfirmed({ commit }, payload) {
         const schemas = payload;
         console.warn({ schemas });
         // const backendResult = await window.electronAPI["CLIENT::schema-confirmed"]({ schema });
         const backendResult = await window.electronAPI["CLIENT::schema-confirmed"](schemas);
         if (!backendResult.status) {
            console.error(backendResult.msg);
            return backendResult;
         }

         // commit("SCHEMA_SELECTED", schema);
         commit("SCHEMA_CONFIRMED", schemas);

         return backendResult;
      },
      async resetSchema({ state, commit }) {

         const currentSchema = state.schema_confirmed;
         if (!currentSchema || Object.keys(currentSchema).length < 1) {
            const msg = `No schema selected`;
            console.error(msg);
            return { status: false, msg }
         }

         const result = await window.electronAPI["CLIENT::schema-reset"]();

         if (!result.status) return result;

         commit("SCHEMA_CONFIRMED", null);
         commit("SCHEMA_SELECTED", null);
         commit("TABLES_INFO", null);
         commit("MISSING_TABLES", null);
         commit("MISSING_COLUMNS", null);

         return result;
      },
   },
   modules: {
      rules,
      results,
      progress,
      panels,
      ...(isDev ? { dev } : {}),
   },
});
