<template>
   <v-sheet>
      <v-expansion-panels v-model="toggle" multiple :disabled="fetching_tables">
         <v-expansion-panel>
            <v-expansion-panel-header v-slot="{ open }">
               <!-- <slot name="panel-header"></slot> -->
               <v-row no-gutters>
                  <v-col cols="4" align="start">
                     <span class="section-title font-weight-bold">
                        <slot name="title"></slot>
                     </span>
                  </v-col>
                  <!-- <v-divider vertical></v-divider> -->
                  <v-fade-transition>
                     <v-col cols="7" align="start" align-self="center">
                        <slot v-if="open" name="header-opened"></slot>
                        <slot v-if="!open" name="header-closed"></slot>
                     </v-col>
                  </v-fade-transition>
                  <v-col cols="1" v-if="validity">
                     <v-icon v-if="validity === 'good'" small>mdi-check</v-icon>
                  </v-col>
               </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
               <slot name="content"></slot>
            </v-expansion-panel-content>
         </v-expansion-panel>
      </v-expansion-panels>
   </v-sheet>
</template>

<script>
export default {
   name: "PanelWrapper",

   props: {
      panelToggle: {
         type: Array,
         required: true,
      },
      validStatus: {
         type: String,
         required: false,
         validator(value) {
            if (!value) return true;
            const enume = ["good", "bad", "warn"];
            const val = value.trim().toLowerCase();
            return enume.includes(val);
         },
      },
   },

   // data: () => ({
   //    expanded: 0, // 0 or undefined.
   // }),

   computed: {
      toggle: {
         get() {
            return this.panelToggle || [];
         },
         set(val) {
            this.$emit("panel-toggle", val);
         },
      },
      validity() {
         const validStatus = this.validStatus;
         if (!validStatus) return false;
         return validStatus.trim().toLowerCase();
      },
      fetching_tables() {
         return this.$store.state.results.fetching_tables;
      },
   },
};
</script>

<style>
</style>