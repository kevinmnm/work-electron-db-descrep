<template>
   <v-sheet>
      <v-sheet v-if="show">
         <!-- <v-data-table :headers="headers" :items="items" dense>
            <template v-slot:top>
               <v-card class="text-center" flat tile>
                  <v-card-text class="db-title">{{ title_prop }}</v-card-text>
               </v-card>
            </template>
         </v-data-table> -->
         <ResultsDataTableWrapper
            :title-prop="title_prop"
            :headers-prop="headers"
            :items-prop="items"
         ></ResultsDataTableWrapper>
      </v-sheet>
      <v-sheet v-if="!show">no data</v-sheet>
   </v-sheet>
</template>

<script>
import ResultsDataTableWrapper from "@/components/wrappers/ResultsDataTableWrapper.vue";

export default {
   name: "ColumnsDataTable",

   components: {
      ResultsDataTableWrapper,
   },

   props: {
      titleProp: {
         type: String,
         required: true,
      },
   },

   data: () => ({
      headers: [
         {
            text: "TABLE",
            value: "table",
         },
         {
            text: "COLUMN",
            value: "column",
         },
      ],
   }),

   computed: {
      show() {
         const titleProp = this.title_prop;
         // const items = this.items;
         // return titleProp && items;
         return !!titleProp;
      },
      title_prop() {
         return this.titleProp;
      },
      missing_columns() {
         return this.$store.state.results.missing_columns;
      },
      items() {
         const missingCols = this.missing_columns;
         const title = this.title_prop;
         if (!missingCols || !title) return;
         return missingCols[title];
      },
   },
};
</script>

<style>
</style>