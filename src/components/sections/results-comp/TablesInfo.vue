<template>
   <v-sheet>
      <!-- <v-data-table :headers="headers" :items="items" dense>
         <template v-slot:top>
            <v-card class="text-center" flat tile>
               <v-card-text class="db-title">{{ titleProp }}</v-card-text>
            </v-card>
         </template>
         <template v-slot:[`item.CREATE_TIME`]="{ item }">
            {{ item.CREATE_TIME ? item.CREATE_TIME.split(" ")[0] : "" }}
         </template>
      </v-data-table> -->
      <ResultsDataTableWrapper
         :type-prop="'tables'"
         :title-prop="titleProp"
         :headers-prop="headers"
         :items-prop="items"
      >
         <!-- <template v-slot:[`item.CREATE_TIME`]="{ item }">
            {{ item.CREATE_TIME ? item.CREATE_TIME.split(" ")[0] : "" }}
         </template> -->
      </ResultsDataTableWrapper>
   </v-sheet>
</template>

<script>
import ResultsDataTableWrapper from "@/components/wrappers/ResultsDataTableWrapper.vue";

export default {
   name: "TablesInfo",

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
      /**
       * {
            TABLE_CATALOG: 'def',
            TABLE_SCHEMA: 'titan',
            TABLE_NAME: 'mdpfiles',
            TABLE_TYPE: 'BASE TABLE',
            ENGINE: 'InnoDB',
            VERSION: 10,
            ROW_FORMAT: 'Dynamic',
            TABLE_ROWS: 0,
            AVG_ROW_LENGTH: 0,
            DATA_LENGTH: 16384,
            MAX_DATA_LENGTH: 0,
            INDEX_LENGTH: 0,
            DATA_FREE: 0,
            AUTO_INCREMENT: null,
            CREATE_TIME: '2019-07-19 16:44:26',
            UPDATE_TIME: null,
            CHECK_TIME: null,
            TABLE_COLLATION: 'latin1_swedish_ci',
            CHECKSUM: null,
            CREATE_OPTIONS: '',
            TABLE_COMMENT: '',
            __title: 'WEB-NSEC'
         }
      **/
      headers: [
         {
            text: "TABLE",
            value: "TABLE_NAME",
         },
         {
            text: "COLLATION",
            value: "TABLE_COLLATION",
         },
         {
            text: "# OF COLUMNS",
            value: "__columns_count",
         },
         {
            text: "# OF ROWS",
            value: "TABLE_ROWS",
         },
         {
            text: "CREATED",
            value: "CREATE_TIME",
         },
      ],
   }),

   computed: {
      // conns() {
      //    return this.$store.state.conns;
      // },
      tables_info() {
         return this.$store.state.results.tables_info;
      },
      items() {
         const tablesInfo = this.tables_info;
         const title = this.titleProp;
         if (!tablesInfo || !title) return [];
         return Object.values(tablesInfo[title]);
      },
   },
};
</script>

<style>
</style>