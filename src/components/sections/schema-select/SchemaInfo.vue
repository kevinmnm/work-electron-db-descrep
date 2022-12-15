<template>
   <v-sheet :width="table_width" outlined>
      <v-data-iterator :items="items" hide-default-footer>
         <template v-slot:default="props">
            <v-row no-gutters>
               <v-toolbar flat>
                  <v-toolbar-title>{{ title }}</v-toolbar-title>
               </v-toolbar>
               <v-col cols="12">
                  <v-card>
                     <v-list dense>
                        <v-list-item
                           v-for="(item, index) in props.items"
                           :key="item.name + index"
                        >
                           <v-list-item-content class="align-center">{{
                              item.name
                           }}</v-list-item-content>
                        </v-list-item>
                     </v-list>
                  </v-card>
               </v-col>
            </v-row>
         </template>
      </v-data-iterator>
   </v-sheet>
</template>

<script>
import { mapGetters } from "vuex";

export default {
   name: "SchemaInfo",

   props: {
      titleProp: {
         type: String,
         required: true,
      },
      connsProp: {
         required: true,
      },
   },

   computed: {
      ...mapGetters([
         "is_mobile",
      ]),
      title() {
         return this.titleProp;
      },
      conns() {
         return this.connsProp;
      },
      titles() {
         const conns = this.conns;
         if (!conns) return;
         return Object.keys(conns);
      },
      conn() {
         const title = this.title;
         const conns = this.conns;
         return conns[title];
      },
      all_schemas() {
         const conn = this.conn;
         const allSchemas = conn.all_schemas;
         return allSchemas;
      },
      items() {
         const schemas = this.all_schemas;
         const items = schemas.map((schema) => {
            const format = {
               name: schema,
            };
            return format;
         });
         return items;
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