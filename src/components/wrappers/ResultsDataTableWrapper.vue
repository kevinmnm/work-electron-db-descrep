<template>
   <v-data-table :headers="headersProp" :items="itemsProp" dense>
      <template v-slot:top>
         <v-card class="text-center" flat tile>
            <v-card-text class="db-title">{{ titleProp }}</v-card-text>
         </v-card>
      </template>

      <template v-if="type === 'tables'" v-slot:[`item.CREATE_TIME`]="{ item }">
         {{ item.CREATE_TIME ? item.CREATE_TIME.split(" ")[0] : "" }}
      </template>

      <template
         v-if="type === 'descre'"
         v-slot:[`item.create_query`]="{ item }"
      >
         <v-sheet color="transparent">
            <v-btn @click="copyToClipboard(item)" icon fab x-small>
               <v-icon x-small>mdi-content-copy</v-icon>
            </v-btn>
         </v-sheet>
      </template>
   </v-data-table>
</template>

<script>
export default {
   name: "ResultsDataTableWrapper",

   props: {
      typeProp: {
         type: String,
         required: false,
      },
      titleProp: {
         type: String,
         required: true,
      },
      headersProp: {
         type: Array,
         required: true,
      },
      itemsProp: {
         type: Array,
         required: true,
      },
   },

   computed: {
      type() {
         return this.typeProp;
      },
   },

   methods: {
      copyToClipboard(item) {
         const query = item.create_query;
         window.navigator.clipboard.writeText(query);
         window.electronAPI["CLIENT::notification"]({
            title: "Copied to Clipboard",
            body: query,
         });
      },
   },
};
</script>

<style>
</style>