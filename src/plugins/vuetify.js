import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
   theme: {
      dark: true,
      themes: {
         dark: {
            "title": '#adff2f',
            "conn-title": '#adff2f',
         }
      }
   },
   breakpoint: {
      mobileBreakpoint: 'sm', // 'sm' = 960.
   },
});
