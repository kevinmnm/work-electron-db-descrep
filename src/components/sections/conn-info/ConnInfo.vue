<template>
   <v-sheet>
      <PanelWrapper :panel-toggle="panel_toggler">
         <template v-slot:title>Connections</template>

         <!-- <template v-slot:header-opened></template> -->
         <template v-slot:header-closed v-if="conns_titles.length > 0">
            <span v-html="panel_desc"></span>
         </template>

         <template v-slot:content>
            <v-sheet
               :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']"
            >
               <v-card
                  v-for="(conn, ind) in conn_limit"
                  :key="ind"
                  class="flex-grow-1"
                  :width="is_mobile ? '100%' : 100 / conn_limit + '%'"
                  outlined
                  flat
               >
                  <ConnForm
                     :dev-creds="dev_only_creds"
                     :dev-index="ind"
                     @collapse-panel="panel_toggler = []"
                  />
               </v-card>
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
      conn_limit() {
         return this.$store.state.conn_limit;
      },
      conns() {
         return this.$store.state.conns;
      },
      conns_titles() {
         const conns = this.conns;
         if (!conns || typeof conns !== "object") return [];
         return Object.keys(conns);
      },
      // conns_count() {
      //    const conns = this.conns;
      //    return Object.values(conns).length;
      // },
      is_mobile() {
         return this.$vuetify.breakpoint.mobile;
      },
      // all_connected() {
      //    return this.conn_limit === this.conns_count;
      // },
      schema_selected: {
         get() {
            return this.$store.state.schema_selected;
         },
         set(schema) {
            // this.$store.commit("SCHEMA_SELECTED", schema);
            this.$store.dispatch("schemaSelected", schema);
         },
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