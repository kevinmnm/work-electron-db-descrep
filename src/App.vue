<template>
   <v-app>
      <v-main>
         <router-view />
      </v-main>
   </v-app>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
   name: "App",

   methods: {
      async initHandler() {
         const test = await window.electronAPI["CLIENT::dbconn"]({a:1});
         console.log(test);
      },
   },

   //@@ App.vue will always be mounted @@//
   mounted() {
      // this.initHandler();
   },
});
</script>
