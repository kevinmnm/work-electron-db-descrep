<template>
   <v-sheet>
      <v-sheet v-if="compared_state && tables_info">
         <PanelWrapper :panel-toggle="panel_toggler">
            <template v-slot:title>Results</template>
            <template v-slot:header-closed>
               <span v-if="schema_confirmed" v-html="panel_desc"></span>
               <span v-if="!schema_confirmed"></span>
            </template>
            <template v-slot:content>
               <v-card>
                  <v-tabs v-model="tab_selected" centered>
                     <v-tab href="#table_list">ALL TABLES</v-tab>
                     <v-tab href="#tables_missing">MISSING TABLES</v-tab>
                     <v-tab href="#columns_missing">MISSING COLUMNS</v-tab>
                  </v-tabs>
               </v-card>
               <v-card>
                  <v-tabs-items v-model="tab_selected">
                     <v-tab-item value="table_list">
                        <v-sheet
                           :class="[
                              'd-flex',
                              is_mobile ? 'flex-column' : 'flex-row',
                           ]"
                        >
                           <v-sheet
                              v-for="(title, ind) in titles"
                              :key="title + ind"
                              :width="table_width"
                              outlined
                           >
                              <TablesInfo :title-prop="title" />
                           </v-sheet>
                        </v-sheet>
                     </v-tab-item>
                     <v-tab-item value="tables_missing">
                        <DescreInfo />
                     </v-tab-item>
                     <v-tab-item value="columns_missing">
                        <ColumnsInfo />
                     </v-tab-item>
                  </v-tabs-items>
               </v-card>
            </template>
         </PanelWrapper>
      </v-sheet>
   </v-sheet>
</template>

<script>
import TablesInfo from "@/components/sections/results-comp/TablesInfo.vue";
import PanelWrapper from "@/components/wrappers/PanelWrapper.vue";
import DescreInfo from "@/components/sections/results-comp/DescreInfo.vue";
import ColumnsInfo from "@/components/sections/results-comp/ColumnsInfo.vue";

export default {
   name: "ResultsComp",

   components: {
      TablesInfo,
      PanelWrapper,
      DescreInfo,
      ColumnsInfo,
   },

   data: () => ({
      tab_selected: null,
   }),

   computed: {
      panel_toggler: {
         get() {
            return this.$store.state.panels.results_toggle;
         },
         set(val) {
            this.$store.commit("RESULTS_TOGGLE", val);
         },
      },
      compared_state() {
         return this.$store.getters.compared_state;
      },
      tables_info() {
         return this.$store.state.results.tables_info;
      },
      titles() {
         const tablesInfo = this.tables_info;
         if (!tablesInfo || tablesInfo.length < 1) return;
         return Object.keys(tablesInfo);
      },
      table_width() {
         const isMobile = this.is_mobile;
         const titles = this.titles;
         if (!isMobile) return 100 / titles.length + "%";
         return "100%";
      },
      is_mobile() {
         return this.$store.getters.is_mobile;
      },
      schema_confirmed() {
         return this.$store.state.schema_confirmed;
      },
      panel_desc() {
         const schemaConfirmed = this.schema_confirmed;
         if (!schemaConfirmed) return "";
         return `Results for <b class="schema-confirmed">${schemaConfirmed}</b> schema`;
      },
   },
};
</script>

<style>
</style>