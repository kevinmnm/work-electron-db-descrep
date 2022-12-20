<template>
   <v-data-table :headers="headersProp" :items="itemsProp" fixed-header dense>
      <template v-if="titleProp" v-slot:top>
         <v-card class="text-center" flat tile>
            <v-card-text class="db-title">{{ titleProp }}</v-card-text>
            <!-- <v-card-actions>
               <v-icon>mdi-delete</v-icon>
            </v-card-actions> -->
            <!-- <v-sheet class="subtitle-1 caption" v-html="descProp"></v-sheet> -->
            <v-sheet
               v-if="descProp"
               class="d-flex flex-row justify-end align-center pl-1 pr-1"
               color="#1b1b1b"
            >
               <v-tooltip top>
                  <template v-slot:activator="{ attrs, on }">
                     <v-hover v-slot="{ hover }">
                        <v-icon
                           v-bind="attrs"
                           v-on="on"
                           :style="{
                              cursor: 'default',
                              opacity: hover ? 1 : 0.6
                           }"
                           small
                           >mdi-help-circle-outline</v-icon
                        >
                     </v-hover>
                  </template>
                  <span v-html="descProp"></span>
               </v-tooltip>
            </v-sheet>
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
         required: false,
      },
      headersProp: {
         type: Array,
         required: true,
      },
      itemsProp: {
         type: Array,
         required: true,
      },
      descProp: {
         type: String,
         required: false,
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