<template>
   <v-sheet>
      <v-sheet
         v-if="show"
         :class="['d-flex', is_mobile ? 'flex-column' : 'flex-row']"
      >
         <v-sheet
            v-for="(mt, index) in mt_entries"
            :key="index"
            :width="table_width"
            outlined
         >
            <DescreDataTable :table-data="mt" />
         </v-sheet>
      </v-sheet>
      <v-sheet v-if="!missing_tables">No missing tables!</v-sheet>
   </v-sheet>
</template>

<script>
import DescreDataTable from "@/components/sections/results-comp/DescreDataTable.vue";

export default {
   name: "DescreInfo",

   components: {
      DescreDataTable,
   },

   computed: {
      show() {
         const mt = this.missing_tables;
         return mt && Object.keys(mt).length > 0;
      },
      missing_tables() {
         return this.$store.state.results.missing_tables;
      },
      mt_entries() {
         if (!this.show) return;
         return Object.entries(this.missing_tables);
      },
      is_mobile() {
         return this.$store.getters.is_mobile;
      },
      table_width() {
         const isMobile = this.is_mobile;
         const mtEntries = this.mt_entries;
         if (!mtEntries) return "auto";
         return isMobile ? "100%" : `${100 / mtEntries.length}%`;
      },
   },
};
</script>

<style>
</style>