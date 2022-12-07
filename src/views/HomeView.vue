<template>
   <v-container>
      <IndexComp />
   </v-container>
</template>

<script>
import Vue from "vue";
import IndexComp from "@/components/IndexComp.vue";

export default Vue.extend({
   name: "HomeView",

   components: { IndexComp },
});
</script>
