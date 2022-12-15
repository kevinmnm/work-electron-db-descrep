<template>
   <v-sheet v-if="show" color="transparent">
      <v-card color="black">
         <v-card-text>
            <v-row class="fill-height" align-content="center" justify="center">
               <v-col class="text-center" cols="12">
                  <span
                     class="caption"
                     style="color: yellow; background: black"
                     v-html="msg"
                  ></span>
               </v-col>
               <v-col cols="6">
                  <v-progress-linear
                     color="yellow"
                     indeterminate
                     rounded
                     height="6"
                  ></v-progress-linear>
               </v-col>
            </v-row>
         </v-card-text>
      </v-card>
   </v-sheet>
</template>

<script>
export default {
   name: "ProgressComp",

   computed: {
      progress() {
         return this.$store.state.progress.progress;
      },
      show() {
         return this.progress?.show || false;
      },
      msg() {
         return this.progress?.msg || "";
      },
   },
};
</script>

<style>
</style>