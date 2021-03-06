<template>
  <v-app 
    id="fittrak" 
    v-if="!$apollo.loading && !error">
    <v-navigation-drawer
      v-model="drawer"
      fixed
      app
      dark
    >
      <Sidebar :viewer=viewer />
    </v-navigation-drawer>

    <v-toolbar 
      color="primary" 
      dark 
      fixed 
      app>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
      <v-toolbar-title 
        class="logo" 
        :class="{ main: $route.name === APP_NAME }">{{ $route.name }}</v-toolbar-title>
      <v-spacer/>
      <v-layout>
        <NewWorkout />
      </v-layout>
    </v-toolbar>

    <v-content>
      <transition 
        name="fade" 
        mode="out-in">
        <router-view />
      </transition>
    </v-content>

    <AppSnackbar />
  </v-app>
  <v-app v-else>
    <v-container
      fill-height
    >
      <v-layout 
        row
        wrap
        align-center
      >
        <v-flex text-xs-center>
          <v-flex>
            <Loader />
            <span class="headline">Firing up ... 💪</span>
          </v-flex>
          <v-flex 
            v-if="error" 
            mt-2>
            <p>
              Hmm, looks like there was an issue making the connection. Please try again!
              If this persists please contact: <a href="mailto:help@fittrak.ca">help@fittrak.ca</a>
            </p>
            <v-btn 
              @click="signOut" 
              depressed 
              color="secondary">Sign out</v-btn>
          </v-flex>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import { queries } from "@/graphql";

import Loader from "@/components/app/Loader";
import Sidebar from "@/components/app/Sidebar";
import AppSnackbar from "@/components/app/AppSnackbar";

import NewWorkout from "@/components/workouts/NewWorkout";

import { APP_NAME, SIGNOUT_URL } from "@/constants";

export default {
  name: "App",

  data() {
    return {
      APP_NAME,
      drawer: null,
      viewer: { username: "Stranger" },
      error: false
    };
  },

  methods: {
    signOut() {
      this.$router.replace(SIGNOUT_URL);
    }
  },

  apollo: {
    viewer: {
      query: queries.viewerQuery,

      update(data) {
        return data.viewer;
      },

      error(error) {
        // TODO: Send error up
        console.log(`Error: ${error}`); // eslint-disable-line
        this.error = true;
      }
    }
  },

  components: {
    Sidebar,
    AppSnackbar,
    NewWorkout,
    Loader
  }
};
</script>

<style>
.logo.main {
  font-family: "Kaushan Script", "Roboto", "Arial";
  font-size: 32px;
}
.logo {
  font-family: "Roboto", "Arial";
  font-size: 24px;
}
</style>
