<template>
   <v-sheet v-if="ready_state">
      <v-sheet v-if="co_schemas_exist">
         <PanelWrapper :panel-toggle="panel_toggler">
            <template v-slot:title>Schema</template>

            <!-- <template v-slot:header-opened>opened</template> -->
            <template v-slot:header-closed>
               <span class="schema-confirmed" v-html="panel_desc"></span>
            </template>

            <template v-slot:content>
               <v-sheet
                  v-if="!schema_confirmed"
                  :class="['d-flex', 'flex-column']"
               >
                  <v-sheet
                     :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']"
                  >
                     <v-card
                        v-for="(conn, index) in conns_array"
                        :key="index"
                        :width="form_width"
                        flat
                        tile
                        outlined
                     >
                        <v-card-title class="db-title">{{
                           conn.title
                        }}</v-card-title>
                        <v-card-text>
                           <v-select
                              v-model="schema_selected"
                              :class="['flex-grow-1']"
                              :label="select_label"
                              filled
                              outlined
                              dense
                              full-width
                              :items="conn.all_schemas"
                              :loading="fetching_tables"
                           ></v-select>
                        </v-card-text>
                     </v-card>
                  </v-sheet>

                  <v-card>
                     <v-btn
                        @click="getSchemasInfo"
                        block
                        outlined
                        :disabled="!schema_selected"
                        :loading="fetching_tables"
                        color="primary"
                        >SELECT</v-btn
                     >
                  </v-card>
               </v-sheet>
               <!-- <v-sheet
                  v-if="!schema_confirmed"
                  :class="['flex', is_mobile ? 'flex-column' : 'flex-row']"
               >
                  <v-card
                     flat
                     tile
                  >
                     <v-select
                        v-model="schema_selected"
                        :class="['flex-grow-1']"
                        :label="select_label"
                        filled
                        outlined
                        dense
                        full-width
                        :items="comparable_schemas"
                        :loading="fetching_tables"
                     ></v-select>
                  </v-card>
                  <v-card>
                     <v-btn
                        @click="getSchemasInfo"
                        block
                        outlined
                        :disabled="!schema_selected"
                        :loading="fetching_tables"
                        color="primary"
                        >SELECT</v-btn
                     >
                  </v-card>
               </v-sheet> -->
               <v-sheet :class="['d-flex', 'flex-column']">
                  <v-sheet
                     v-if="schema_confirmed"
                     :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']"
                  >
                     <v-card
                        class="d-flex flex-row flex-grow-1"
                        flat
                        tile
                        outlined
                     >
                        <v-card-text
                           class="schema-confirmed"
                           v-html="schema_confirmed"
                        ></v-card-text>
                        <v-card-actions>
                           <v-btn
                              @click="changeSchema"
                              block
                              text
                              tile
                              outlined
                              height="100%"
                              :disabled="fetching_tables"
                              :loading="fetching_tables"
                              color="primary"
                              >CHANGE</v-btn
                           >
                        </v-card-actions>
                     </v-card>
                  </v-sheet>
                  <v-sheet v-if="false" :class="['d-flex', 'flex-row']">
                     <SchemaInfo
                        v-for="(conn, ind) in conns_array"
                        :key="conn + ind + 1"
                        :title-prop="conn.title"
                        :conns-prop="conns"
                     />
                  </v-sheet>
               </v-sheet>
            </template>
         </PanelWrapper>
      </v-sheet>

      <v-sheet v-if="!co_schemas_exist" v-html="no_co_schemas_msg"></v-sheet>
   </v-sheet>
</template>

<script>
import { mapGetters } from "vuex";
import PanelWrapper from "@/components/wrappers/PanelWrapper.vue";
import SchemaInfo from "@/components/sections/schema-select/SchemaInfo.vue";

export default {
   name: "SchemaSelect",

   components: {
      PanelWrapper,
      SchemaInfo,
   },

   computed: {
      ...mapGetters([
         "ready_state",
         "comparable_schemas",
         "comparable_state",
         "is_mobile",
      ]),
      panel_toggler: {
         get() {
            return this.$store.state.panels.schema_toggle;
         },
         set(val) {
            this.$store.commit("SCHEMA_TOGGLE", val);
         },
      },
      schema_selected: {
         get() {
            return this.$store.state.schema_selected;
         },
         set(schema) {
            // this.$store.dispatch("schemaSelected", schema);
            this.$store.commit("SCHEMA_SELECTED", schema);
         },
      },
      schema_confirmed() {
         return this.$store.state.schema_confirmed;
      },
      co_schemas_exist() {
         return this.comparable_schemas.length > 0;
      },
      fetching_tables() {
         return this.$store.state.results.fetching_tables;
      },
      panel_desc() {
         const schemaConfirmed = this.schema_confirmed;
         if (!schemaConfirmed) return "";
         return `<b>${schemaConfirmed}</b>`;
      },
      conns() {
         return this.$store.state.conns;
      },
      // conns_entries() {
      //    if (!this.conns) return;
      //    return Object.entries(this.conns);
      // },
      titles() {
         if (!this.conns) return;
         return Object.keys(this.conns);
      },
      conns_array() {
         if (!this.conns) return;
         return Object.values(this.conns);
      },
      no_co_schemas_msg() {
         const conns = this.conns;
         if (!conns) return "No DB connections";
         const titles = Object.keys(conns);
         const titlesFormat = titles.map((title) => `<b>${title}</b>`);
         const formatted = titlesFormat.join(", ");
         const msg = `There are no co-existing schemas between databases ${formatted}. Please try
         different connections.`;
         return msg;
      },
      select_label() {
         // const label = `Choose from list of schemas that co-exists in all databases`;
         const label = `List of co-existing schemas in connected DBs`;
         return label;
      },
      form_width() {
         const isMobile = this.is_mobile;
         const titles = this.titles;
         if (!titles) return "auto";
         return isMobile ? "100%" : `${100 / titles.length}%`;
      },
   },

   methods: {
      async getSchemasInfo() {
         const schemaSelected = this.schema_selected;
         this.$store.commit("CONNECTION_TOGGLE", []);
         this.$store.commit("SCHEMA_TOGGLE", []);
         await this.$store.dispatch("schemaConfirmed", schemaSelected);
         this.$store.commit("SCHEMA_CONFIRMED", this.schema_selected);
         await this.$store.dispatch("getSchemasInfo");
         // this.panel_toggler = [];
      },
      changeSchema() {
         this.$store.dispatch("resetSchema");
      },
   },
};
</script>

<style>
</style>