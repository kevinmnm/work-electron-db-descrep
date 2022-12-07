<template>
   <v-sheet>
      <!-- <v-text-field></v-text-field> -->
      <v-form>
         <v-text-field label="Title"></v-text-field>
         <v-text-field label="Host"></v-text-field>
         <v-text-field label="Username"></v-text-field>
         <v-text-field label="Port"></v-text-field>
         <v-text-field label="Password"></v-text-field>
         <v-btn @click="connectHandler">CONNECT</v-btn>
      </v-form>
   </v-sheet>
</template>

<script>
export default {
   name: "IndexComp",

   methods: {
      async connectHandler() {
         const result = await window.electronAPI["CLIENT::init-conn"]({
            title: "Test-Title",
            host: "127.0.0.1",
            port: 3306,
            password: "",
         });
         console.log(result.query);

         if (!result.status) return;

         const cache = await window.electronAPI["CLIENT::get-conns"]();
         console.warn(cache);
      },
   },
};
</script>

<style>
</style>