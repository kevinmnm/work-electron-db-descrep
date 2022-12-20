export default {
   state: {
      login_btn: null, // null will render loading, true will show, false will hide.
      login: {
         show: false,
         form_valid: false,
         username: null,
         password: null,
         sec_code: null,
      },
      logged_in: false,
      conns: {

      }
   },

   mutations: {
      LOGIN_BTN(state, payload) {
         state.login_btn = payload;
      },
      LOGIN(state, payload) {
         state.login = {
            ...state.login,
            ...payload,
         }
      },
      LOGIN_SHOW(state, payload) {
         state.login.show = payload;
      },
      LOGIN_FORM_VALID(state, payload) {
         state.login.form_valid = payload;
      },
      LOGIN_USERNAME(state, payload) {
         state.login.username = payload;
      },
      LOGIN_PASSWORD(state, payload) {
         state.login.password = payload;
      },
      LOGIN_SEC_CODE(state, payload) {
         state.login.sec_code = payload;
      },
      LOGGED_IN(state, payload) {
         state.logged_in = payload;
      },
   },

   actions: {

   },
};