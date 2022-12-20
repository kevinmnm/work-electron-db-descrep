<template>
   <v-sheet>
      <v-card v-if="!connected" flat>
         <v-card-text>
            <v-form v-model="form_valid">
               <v-text-field
                  v-model.trim="title"
                  label="Title"
                  outlined
                  dense
                  @input="title_is_unique = false"
                  :loading="conn_fetching"
                  :disabled="conn_fetching || title_is_unique"
                  :rules="[
                     ...default_rules,
                     rules.special,
                     rules.reserved,
                     rules.uppercase,
                     rules.string,
                     rules.minimum,
                  ]"
                  :persistent-hint="title_is_unique"
                  :hint="title_hint"
                  color="success"
               >
                  <template v-slot:append-outer>
                     <v-btn
                        v-if="!title_is_unique"
                        @click="checkDuplicateTitle"
                        icon
                        dense
                        rounded
                        height="100%"
                        :disabled="
                           !title ||
                           !title.trim() ||
                           title !== title.toUpperCase()
                        "
                        :color="title_is_unique ? 'success' : null"
                     >
                        <v-icon dense>mdi-check-outline</v-icon>
                     </v-btn>
                     <v-icon v-if="title_is_unique" color="success" dense
                        >mdi-lock</v-icon
                     >
                  </template>
               </v-text-field>
               <v-text-field
                  v-model.trim="host"
                  label="Host"
                  outlined
                  dense
                  :loading="conn_fetching"
                  :disabled="conn_fetching || !title_is_unique"
                  :rules="[...default_rules, rules.reserved]"
               ></v-text-field>
               <v-text-field
                  v-model.trim="user"
                  label="Username"
                  outlined
                  dense
                  :loading="conn_fetching"
                  :disabled="conn_fetching || !title_is_unique"
                  :rules="[...default_rules]"
               ></v-text-field>
               <!-- <v-text-field
               v-model.trim="databse"
               label="Schema"
               outlined
               dense
            ></v-text-field> -->
               <v-text-field
                  v-model.trim="port"
                  placeholder="3306"
                  label="Port"
                  outlined
                  dense
                  type="number"
                  :loading="conn_fetching"
                  :disabled="conn_fetching || !title_is_unique"
               ></v-text-field>
               <v-text-field
                  v-model.trim="password"
                  label="Password"
                  outlined
                  dense
                  type="password"
                  :rules="[rules.unspaced]"
                  :loading="conn_fetching"
                  :disabled="conn_fetching || !title_is_unique"
               ></v-text-field>
               <v-btn
                  @click="connectHandler"
                  :disabled="!form_valid || conn_fetching || !title_is_unique"
                  :loading="conn_fetching"
                  color="primary"
                  block
                  text
                  tile
                  outlined
                  >CONNECT</v-btn
               >
            </v-form>
         </v-card-text>
      </v-card>
      <v-card v-if="connected" flat>
         <v-card-title class="title--text">{{ title }}</v-card-title>
         <v-divider></v-divider>
         <v-card-text>
            <v-simple-table v-if="conn_table">
               <template v-slot:default>
                  <tbody>
                     <tr
                        v-for="(conn, ind) in conn_table"
                        :key="ind"
                        :class="[]"
                     >
                        <td>
                           {{ conn[0].toUpperCase().replaceAll("_", " ") }}
                        </td>
                        <td>:</td>
                        <td>{{ conn[1] }}</td>
                     </tr>
                  </tbody>
               </template>
            </v-simple-table>
         </v-card-text>
      </v-card>
      <v-sheet>
         <v-alert v-show="alert.show" :type="alert.type">{{
            alert.msg
         }}</v-alert>
      </v-sheet>
   </v-sheet>
</template>

<script>
export default {
   name: "ConnForm",

   props: {
      // devCred: {
      //    type: Object,
      //    required: false,
      // },
      devCreds: {
         type: Array,
         required: false,
      },
      devIndex: {
         type: Number,
         required: false,
      },
   },

   data: () => ({
      title: null,
      title_is_unique: false,
      host: null,
      user: null,
      database: null,
      port: "3306",
      password: null,
      alert: {
         show: false,
         type: "info",
         msg: "",
      },
      form_valid: false,
   }),

   computed: {
      conns() {
         return this.$store.state.conns;
      },
      // title: {
      //    get() {

      //    },
      //    set(val) {
      //       this.title = val;
      //       this.commit("CONN_TITLE_INPUTS"
      //    }
      // },
      conn_title_inputs() {
         return this.$store.state.conn_title_inputs;
      },
      title_hint() {
         const isUnique = this.title_is_unique;
         return isUnique ? "Verified!" : "Title must be unique";
      },
      // title_exists() {
      //    const conns = this.conns;
      //    const connsTitles = Object.keys(conns);
      //    const confirmedTitles = this.conn_title_inputs;
      //    const allExistingTitles = [...connsTitles, confirmedTitles];
      //    const currentInput = this.title;

      //    return allExistingTitles.includes(currentInput);
      // },
      rules() {
         return this.$store.getters.input_rules;
      },
      default_rules() {
         const rules = this.rules;
         return [
            rules.required,
            rules.unspaced,
            // rules.special,
            // rules.reserved,
         ];
      },
      connected() {
         const conns = this.conns;
         const title = this.title;
         const isUnique = this.title_is_unique;
         const connected = !!conns?.[title] && isUnique;
         return connected;
      },
      conn_table_filter() {
         return this.$store.state.conn_table_filter;
      },
      conn_table() {
         const conns = this.conns;
         const title = this.title;
         const filter = this.conn_table_filter;
         if (!conns || !title || !filter) return;
         const conn = conns[title];
         if (!conn) return;
         // const filter = {
         //    host: conn.host,
         //    port: conn.port,
         //    user: conn.user,
         // };
         const filtered = {};
         filter.forEach((prop) => (filtered[prop] = conn[prop]));
         return Object.entries(filtered);
      },
      conn_limit() {
         return this.$store.state.conn_limit;
      },
      conn_desired() {
         return this.$store.state.conn_desired;
      },
      conn_fetching() {
         return this.$store.state.conn_fetching;
      },
   },

   methods: {
      checkDuplicateTitle() {
         this.resetAlert();
         const title = this.title;
         const conns = this.conns;
         const connsTitles = Object.keys(conns);
         const confirmedTitles = this.conn_title_inputs;
         const allExistingTitles = [...connsTitles, ...confirmedTitles];

         console.warn({ allExistingTitles });

         const isDup = allExistingTitles.includes(title);

         if (isDup) {
            this.title_is_unique = false;
            this.alert = {
               ...this.alert,
               show: true,
               type: "error",
               msg: "Duplicate title detected!",
            };
            return;
         }

         this.title_is_unique = true;
         const newConfirms = [...confirmedTitles, title];
         this.$store.commit("CONN_TITLE_INPUTS", newConfirms);
      },
      async connectHandler() {
         this.resetAlert();

         // const titleConfirmed = this.title_confirmed;
         // // If title is a duplicate //
         // if (!titleConfirmed) {
         //    this.alert = {
         //       ...this.alert,
         //       show: true,
         //       type: 'error',
         //       msg: 'Duplicate title detected!'
         //    }
         //    return;
         // }

         // await this.$store.dispatch("updateConns");

         this.$store.commit("CONN_FETCHING", true);
         try {
            const result = await window.electronAPI["CLIENT::init-conn"]({
               title: this.title,
               host: this.host,
               database: this.database,
               user: this.user,
               port: this.port || 3306,
               password: this.password,
            });

            if (!result.status) {
               this.alert = {
                  ...this.alert,
                  show: true,
                  type: "error",
                  msg: result.msg,
               };
               return;
            }

            await this.$store.dispatch("updateConns");

            const conns = this.conns;
            const connsLength = Object.keys(conns).length;
            const connLimit = this.conn_limit;

            if (connsLength === connLimit) {
               this.$emit("collapse-panel");
            }
         } catch (error) {
            console.error(error);
         } finally {
            this.$store.commit("CONN_FETCHING", false);
         }
      },
      resetAlert() {
         this.alert = {
            show: false,
            type: "info",
            msg: "",
         };
      },
   },

   beforeMount() {
      (() => {
         if (!this.devCreds) return;
         const devCreds = this.devCreds[this.devIndex];
         for (const prop in devCreds) {
            const val = devCreds[prop];
            this[prop] = val;
         }
      })();
   },
};
</script>

<style>
</style>