<template>
   <v-app>
      <v-app-bar dense app>
         <v-app-bar-nav-icon></v-app-bar-nav-icon>

         <v-toolbar-title>DB Comparison Tool</v-toolbar-title>

         <v-spacer></v-spacer>

         <v-tooltip bottom>
            <template v-slot:activator="{ attrs, on }">
               <v-btn
                  v-show="login_btn_show"
                  v-bind="attrs"
                  v-on="on"
                  icon
                  :loading="login_btn_loading"
                  @click="showLoginDialog"
               >
                  <v-icon dense>mdi-account</v-icon>
               </v-btn>
            </template>
            <span>LOGIN</span>
         </v-tooltip>
      </v-app-bar>
      <v-main>
         <router-view />
      </v-main>
   </v-app>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
   name: "App",

   // components: { LoginDialog },

   computed: {
      schema_confirmed() {
         return this.$store.state.schema_confirmed;
      },
      logged_in() {
         return this.$store.state.creds.logged_in;
      },
      login_btn() {
         return this.$store.state.creds.login_btn;
      },
      login_btn_loading() {
         const btn = this.login_btn;
         return btn === null;
      },
      login_btn_show() {
         const loggedIn = this.loggedin;
         const btn = this.login_btn;
         if (loggedIn) return false;
         if (btn === null || btn) return true;
         return btn;
      },
   },

   methods: {
      showLoginDialog() {
         this.$store.commit("LOGIN", { show: true });
      },
      async triggerUponRefresh() {
         console.warn("triggerUponRefresh()");
         // Triggered when page refreshes.
         this.registerProcessListeners();
         await window.electronAPI["CLIENT::init"]();
         const avail = await window.electronAPI["CLIENT::user-login-avail"]();
         this.$store.commit("LOGIN_BTN", avail.status);
         console.warn("done..?");
      },
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

            // event.sender.send("CLIENT::notification", {
            //    title: "Schema Changed",
            //    body: ``,
            // });

            const currSchConf = this.schema_confirmed;

            for (const title in payload) {
               let sendNoti = false;
               if (currSchConf && currSchConf[title]) {
                  sendNoti = `${currSchConf[title]} -> ${payload[title]}`;
               }
               // this.$store.commit("SCHEMA_SELECTED", {
               this.$store.commit("SCHEMA_CONFIRMED", {
                  title,
                  value: payload,
               });

               if (sendNoti) {
                  event.sender.send("CLIENT::notification", {
                     title: "Schema Changed",
                     body: sendNoti,
                  });
               }
            }
         });

         //## BACKG::progress ##//
         window.electronAPI["BACKG::progress"]((event, payload) => {
            this.$store.dispatch("progress", payload);
         });

         //## BACKG::user-login-avail ##//
         // window.electronAPI["BACKG::user-login-avail"]((event, payload) => {
         //    console.warn("BACKG::user-login-avail", payload);
         //    this.$store.commit("LOGIN_BTN", payload.status);
         // });
      },
   },

   beforeMount() {
      // this.registerProcessListeners();
      this.triggerUponRefresh();
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
