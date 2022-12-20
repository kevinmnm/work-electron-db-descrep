<template>
   <v-sheet>
      <PanelWrapper :panel-toggle="panel_toggler">
         <template v-slot:title>Connections</template>

         <!-- <template v-slot:header-opened></template> -->
         <template v-slot:header-closed v-if="conns_titles.length > 0">
            <v-sheet
               v-if="conns_entries && conns_entries.length > 0"
               color="transprent"
            >
               <template v-for="(entry, index) in conns_entries">
                  <v-tooltip :key="entry + index" top>
                     <template v-slot:activator="{ attrs, on }">
                        <!-- <span v-bind="attrs" v-on="on" v-html="panel_desc"></span> -->
                        <span v-bind="attrs" v-on="on">
                           <b class="db-title">{{ entry[0] }}</b>
                        </span>
                     </template>
                     <v-sheet color="transparent">
                        {{ entry[1].host }}
                     </v-sheet>
                  </v-tooltip>
                  <span
                     v-if="index !== conns_entries.length - 1"
                     :key="index"
                     >{{ " vs " }}</span
                  >
               </template>
            </v-sheet>
         </template>

         <template v-slot:content>
            <v-sheet>
               <!-- <v-sheet :class="['d-flex', 'justify-center', 'align-center']">
                  <v-btn dense text outlined @click="getPrefilledConns"
                     >CHOOSE FROM EXISTING CONNECTIONS</v-btn
                  >
               </v-sheet>

               <v-sheet class="text-center caption ma-2">- OR -</v-sheet>
               <v-sheet class="d-flex justify-center align-center"
                  >CONNECT MANUALLY</v-sheet
               > -->
               <v-sheet class="d-flex flex-row justify-end">
                  <v-tooltip top>
                     <template v-slot:activator="{ attrs, on }">
                        <v-btn
                           @click="addConnection"
                           icon
                           outlined
                           tile
                           v-bind="attrs"
                           v-on="on"
                           :disabled="show_delete_btn"
                        >
                           <v-icon>mdi-plus</v-icon>
                        </v-btn>
                     </template>
                     <span>Add Connection</span>
                  </v-tooltip>
               </v-sheet>
               <v-sheet
                  :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']"
               >
                  <v-card
                     v-for="(conn, ind) in conn_desired"
                     :key="ind"
                     class="flex-grow-1"
                     :width="is_mobile ? '100%' : 100 / conn_desired + '%'"
                     outlined
                     flat
                  >
                     <v-sheet
                        class="d-flex flex-row align-center"
                        height="40px"
                        outlined
                     >
                        <v-card-subtitle>Connection</v-card-subtitle>
                        <v-spacer></v-spacer>
                        <v-btn
                           v-if="show_delete_btn && ind > 1"
                           icon
                           fab
                           small
                           @click="removeConnection"
                        >
                           <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                     </v-sheet>
                     <v-card-text>
                        <ConnForm
                           :dev-creds="dev_only_creds"
                           :dev-index="ind"
                           @collapse-panel="panel_toggler = []"
                        />
                     </v-card-text>
                  </v-card>
               </v-sheet>
            </v-sheet>
         </template>
      </PanelWrapper>
   </v-sheet>
</template>

<script>
import ConnForm from "@/components/sections/conn-info/ConnForm.vue";
import PanelWrapper from "@/components/wrappers/PanelWrapper.vue";

export default {
   name: "ConnInfo",

   components: {
      PanelWrapper,
      ConnForm,
   },

   computed: {
      panel_toggler: {
         get() {
            return this.$store.state.panels.connection_toggle;
         },
         set(val) {
            this.$store.commit("CONNECTION_TOGGLE", val);
         },
      },
      conn_min() {
         return this.$store.state.conn_min;
      },
      conn_limit() {
         return this.$store.state.conn_limit;
      },
      conn_desired() {
         return this.$store.state.conn_desired;
      },
      show_add_conn_btn() {
         const limit = this.conn_limit;
         const desired = this.conn_desired;
         return desired >= limit;
      },
      show_delete_btn() {
         const min = this.conn_min;
         const limit = this.conn_limit;
         const desired = this.conn_desired;

         // This shouldn't happen!
         if (min > limit) return false;

         // Minimum needed (2) is same as maximum allowed.
         if (limit === min) return false;

         // Desired is already at minimum required.
         if (desired === min) return false;

         // If desired is within maximum allowed.
         if (desired <= limit && desired >= min) return true;

         return false;
      },
      conns() {
         return this.$store.state.conns;
      },
      conns_entries() {
         const conns = this.conns;
         if (!conns || typeof conns !== "object") return [];
         return Object.entries(conns);
      },
      conns_titles() {
         const conns = this.conns;
         if (!conns || typeof conns !== "object") return [];
         return Object.keys(conns);
      },
      is_mobile() {
         return this.$vuetify.breakpoint.mobile;
      },
      comparable_schemas() {
         return this.$store.getters.comparable_schemas;
      },
      panel_desc() {
         const connsTitles = this.conns_titles;
         if (!connsTitles || connsTitles.length < 1) return "";
         const format = connsTitles.map(
            (title) => `<b class="title--text">${title}</b>`
         );
         return format.join(" vs ");
      },
      logged_in() {
         return this.$store.state.creds.logged_in;
      },
   },

   methods: {
      getPrefilledConns() {
         const loggedIn = this.logged_in;

         if (!loggedIn) {
            this.$store.commit("LOGIN_SHOW", true);
            return;
         }
      },
      addConnection() {
         const desired = this.conn_desired;
         const max = this.conn_limit;
         if (desired >= max) return;

         this.$store.commit("CONN_DESIRED", desired + 1);
      },
      removeConnection() {
         const desired = this.conn_desired;
         const min = this.conn_min;
         if (desired <= min) return;

         this.$store.commit("CONN_DESIRED", desired - 1);
      },
   },

   beforeMount() {
      //!! For development only !!//
      (() => {
         const devCreds = [
            {
               title: "WEB-DEV",
               host: "172.16.0.174",
               user: "web_access",
               password: "w4rF1ghT3r$@6007",
            },
            {
               title: "WEB-NSEC",
               host: "172.16.118.145",
               user: "kevin.song",
               password: "g00dB4Dug1y*1966!",
            },
         ];

         this.dev_only_creds = devCreds;
      })();
   },
};
</script>

<style>
</style>