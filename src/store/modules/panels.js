export default {
   state: {
      connection_toggle: [0], // Expand by default
      schema_toggle: [0], // Expand by default
      results_toggle: [0], // Expand by default
   },

   mutations: {
      CONNECTION_TOGGLE(state, payload) {
         state.connection_toggle = payload;
      },
      SCHEMA_TOGGLE(state, payload) {
         state.schema_toggle = payload;
      },
      RESULTS_TOGGLE(state, payload) {
         state.results_toggle = payload;
      },
   },
};