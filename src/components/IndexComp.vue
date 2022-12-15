<template>
   <v-sheet
      :class="['d-flex', 'flex-column', 'flex-grow-1']"
      color="transparent"
   >
      <v-sheet outlined>
         <ConnInfo />
      </v-sheet>
      <v-sheet outlined>
         <SchemaSelect />
      </v-sheet>
      <v-sheet outlined>
         <ResultsComp />
      </v-sheet>
      <v-sheet outlined>
         <ProgressComp />
      </v-sheet>
   </v-sheet>
</template>

<script>
import ConnInfo from "@/components/sections/conn-info/ConnInfo.vue";
import SchemaSelect from "@/components/sections/schema-select/SchemaSelect.vue";
import ResultsComp from "@/components/sections/results-comp/ResultsComp.vue";
import ProgressComp from "@/components/ProgressComp.vue";

export default {
   name: "IndexComp",

   components: {
      ConnInfo,
      SchemaSelect,
      ResultsComp,
      ProgressComp,
   },

   computed: {
      fetching_tables() {
         return this.$store.state.results.fetching_tables;
      },
   },
};
</script>

<style>
</style>