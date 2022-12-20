<template>
   <v-row justify="center">
      <v-dialog v-model="show" persistent :max-width="400">
         <v-card outlined>
            <v-card-title>Login</v-card-title>
            <v-card-text>
               <v-form v-model="form_valid">
                  <v-text-field
                     v-model="username"
                     label="Username"
                     outlined
                     dense
                     type="text"
                     :rules="[input_rules.required, input_rules.unspaced]"
                  ></v-text-field>
                  <v-text-field
                     v-model="password"
                     label="Password"
                     outlined
                     dense
                     type="password"
                     :rules="[input_rules.required, input_rules.unspaced]"
                  ></v-text-field>
                  <v-text-field
                     v-model="sec_code"
                     label="Security Code"
                     outlined
                     dense
                     type="password"
                     le
                     :rules="[
                        input_rules.required,
                        input_rules.unspaced,
                        input_rules.secode,
                     ]"
                  ></v-text-field>
                  <!-- <v-otp-input length="4"></v-otp-input> -->
                  <v-sheet :class="['d-flex', 'flex-row', 'flex-wrap']">
                     <v-btn
                        width="50%"
                        color="error"
                        text
                        outlined
                        @click="show = false"
                        >CANCEL</v-btn
                     >
                     <v-btn
                        width="50%"
                        color="primary"
                        text
                        outlined
                        :disabled="!form_valid"
                        :key="form_valid"
                        >LOGIN</v-btn
                     >
                  </v-sheet>
               </v-form>
            </v-card-text>
         </v-card>
      </v-dialog>
   </v-row>
</template>

<script>
import { mapGetters } from "vuex";

export default {
   name: "LoginDialog",

   computed: {
      login() {
         return this.$store.state.creds.login;
      },
      show: {
         get() {
            return this.login.show;
         },
         set(value) {
            this.$store.commit("LOGIN_SHOW", value);
         },
      },
      form_valid: {
         get() {
            return this.login.form_valid;
         },
         set(value) {
            this.$store.commit("LOGIN_FORM_VALID", value);
         },
      },
      username: {
         get() {
            return this.login.username;
         },
         set(value) {
            this.$store.commit("LOGIN_USERNAME", value);
         },
      },
      password: {
         get() {
            return this.login.password;
         },
         set(value) {
            this.$store.commit("LOGIN_PASSWORD", value);
         },
      },
      sec_code: {
         get() {
            return this.login.sec_code;
         },
         set(value) {
            this.$store.commit("LOGIN_SEC_CODE", value);
         },
      },
      ...mapGetters(["is_mobile", "input_rules"]),
   },
};
</script>

<style>
</style>