<template>
   <v-app>
      <v-app-bar dense app>
         <v-app-bar-nav-icon></v-app-bar-nav-icon>

         <v-toolbar-title>Page title</v-toolbar-title>

         <v-spacer></v-spacer>
      </v-app-bar>
      <v-main>
         <router-view />
      </v-main>
   </v-app>
</template>

<script>
import Vue from "vue";
// import { ipcRenderer } from "electron";

export default Vue.extend({
   name: "App",

   methods: {
      registerProcessListeners() {
         //## BACKG::schema-confirmed ##//
         window.electronAPI["BACKG::schema-confirmed"]((event, payload) => {
            console.warn({ event, payload, test: this });

            if (
               !payload ||
               typeof payload !== "object" ||
               Array.isArray(payload) ||
               payload === null
            )
               throw new Error("Schema gone wrong..");

            event.sender.send("CLIENT::notification", {
               title: "Schema Changed",
               body: ``,
            });
            // const schema = !payload ? null : payload.schema;
            // const title = payload.title;

            // this.$store.commit("SCHEMA_SELECTED", { title, value: schema });

            for (const title in payload) {
               this.$store.commit("SCHEMA_SELECTED", {
                  title,
                  value: payload,
               });
            }
         });

         //## BACKG::progress ##//
         window.electronAPI["BACKG::progress"]((event, payload) => {
            this.$store.dispatch("progress", payload);
         });
      },
   },

   beforeMount() {
      // Triggered when page refreshes.
      window.electronAPI["CLIENT::init"]();

      this.registerProcessListeners();
   },
});
</script>

<style>
.section-title {
   font-size: 20px;
}

.db-title {
   color: greenyellow !important;
   font-weight: bold !important;
}

.schema-confirmed {
   font-weight: bold !important;
   /* color: rgb(202, 202, 255) !important; */
   color: #64ffda !important;
   -webkit-text-stroke: 0.1px black !important;
}
</style>
