<template>
   <v-sheet v-if="table_data">
      <!-- <v-data-table :headers="headers" :items="items" dense>
         <template v-slot:top>
            <v-card class="text-center" flat tile>
               <v-card-text class="db-title">{{ title }}</v-card-text>
            </v-card>
         </template>

         <template v-slot:[`item.create_query`]="{ item }">
            <v-sheet color="transparent">
               <v-btn @click="copyToClipboard(item)" icon fab x-small>
                  <v-icon x-small>mdi-content-copy</v-icon>
               </v-btn>
            </v-sheet>
         </template>
      </v-data-table> -->
      <ResultsDataTableWrapper
         :type-prop="'descre'"
         :title-prop="title"
         :headers-prop="headers"
         :items-prop="items"
      ></ResultsDataTableWrapper>
   </v-sheet>
</template>

<script>
import ResultsDataTableWrapper from "@/components/wrappers/ResultsDataTableWrapper.vue";

export default {
   name: "DescreDataTable",

   components: {
      ResultsDataTableWrapper,
   },

   props: {
      tableData: {
         required: true,
      },
   },

   data: () => ({
      headers: [
         {
            text: "MISSING TABLES",
            value: "missing_table",
         },
         {
            text: "EXISTS IN",
            value: "exists_in",
         },
         {
            text: "CREATE QUERY",
            value: "create_query",
         },
      ],
   }),

   computed: {
      schema_confirmed() {
         return this.$store.state.schema_confirmed;
      },
      table_data() {
         return this.tableData;
      },
      title() {
         return this.table_data[0];
      },
      content() {
         return this.table_data[1];
      },
      items() {
         // const schema = this.schema_confirmed;
         const content = this.content;
         const items = content.map((cont) => {
            return {
               missing_table: cont.name,
               exists_in: cont.exists_in,
               create_query: cont.create_query,
               // query_string: `SHOW CREATE TABLE ${schema}.${cont.name}`,
            };
         });

         return items;
      },
   },

   methods: {
      copyToClipboard(query) {
         return query;
      },
   },
};
</script>

<style>
</style>