<template>
   <v-sheet>
      <v-sheet :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']">
         <v-sheet
            v-for="(title, index) in titles"
            :key="title + index"
            :width="table_width"
            outlined
         >
            <ColumnsDataTable :title-prop="title" />
         </v-sheet>
      </v-sheet>
   </v-sheet>
</template>

<script>
import ColumnsDataTable from "@/components/sections/results-comp/ColumnsDataTable.vue";

export default {
   name: "ColumnsInfo",

   components: {
      ColumnsDataTable,
   },

   computed: {
      tables_info() {
         return this.$store.state.results.tables_info;
      },
      titles() {
         const tablesInfo = this.tables_info;
         if (!tablesInfo) return;
         return Object.keys(tablesInfo);
      },
      is_mobile() {
         return this.$store.getters.is_mobile;
      },
      table_width() {
         const isMobile = this.is_mobile;
         const titles = this.titles;
         if (!titles) return "auto";
         return isMobile ? "100%" : `${100 / titles.length}%`;
      },
   },
};
</script>

<style>
</style>