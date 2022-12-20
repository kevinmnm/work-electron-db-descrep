<template>
   <v-container fluid>
      <IndexComp />
      <LoginDialog />
   </v-container>
</template>

<script>
import Vue from "vue";
import IndexComp from "@/components/IndexComp.vue";
import LoginDialog from "@/components/login-comp/LoginDialog.vue";

export default Vue.extend({
   name: "HomeView",

   components: { IndexComp, LoginDialog },
});
</script>
