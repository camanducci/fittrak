<template>
  <v-flex text-xs-right>
    <v-dialog 
      v-model="dialog" 
      fullscreen 
      hide-overlay 
      transition="dialog-bottom-transition">
      <v-btn 
        icon
        dark
        slot="activator" 
        color="primaryDark" 
        @click.stop="createWorkout" 
        :loading="loading" 
      ><v-icon>add</v-icon></v-btn>
      <v-card>
        <v-toolbar 
          dark 
          color="primary"
          fixed
        >
          <v-btn 
            icon 
            dark 
            @click.native="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>New Workout</v-toolbar-title>
          <v-spacer/>
          <v-toolbar-items>
            <v-btn 
              dark 
              flat 
              @click.native="startWorkout">Start</v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <!-- Body -->

        <v-layout 
          row 
          wrap
          class="mt-4" 
        >

          <v-flex>
            <p class="headline grey--text text--darken-2 ma-3 mt-5">
              Set up your workout
            </p>
            <p class="subheading ma-3 grey--text text--darken-2">Stage your workout below by selecting exercises. Once
            you're ready hit "Start" to begin the workout.</p>
            <v-divider />
          </v-flex>

          <v-flex 
            xs12 
          >
            <v-subheader>Staged workout</v-subheader>
            <v-flex 
              v-if="selectedExercises.length" 
              mb-4
              mr-2
              ml-2
            >
              <v-chip 
                color="primaryDark"
                :key="exercise.id"
                dark
                v-for="exercise in selectedExercises"
              >
                {{ exercise.name }}
                <v-icon 
                  right
                  @click.stop="deselectExercise(exercise.id)">cancel</v-icon>
              </v-chip>
            </v-flex>
            <v-flex 
              v-else
              mr-3
              ml-3
            >
              <p class="subheading grey--text text--darken-2">No exercises selected yet!</p>
            </v-flex>

            <v-divider/>
          </v-flex>

          <v-flex 
            xs12 
            mt-3>
            <v-subheader>Popular exercises</v-subheader>
            <v-flex 
              v-if="popularExerciseTypes.length" 
              mr-2 
              ml-2>
              <v-chip 
                v-for="exercise in popularExerciseTypes" 
                :key="exercise.id"
                :disabled="inSelected(exercise.id)"
                color="darkGrey"
                dark 
              >
                {{ exercise.name }} 
                <v-icon 
                  right
                  @click.stop="selectExercise(exercise)"
                >add_circle</v-icon>
              </v-chip>
            </v-flex>

            <v-flex 
              mt-3
              mr-3 
              ml-3>
              <p class="subheading grey--text text--darken-2"> Popular exercises are
              intelligently selected across all users with a bias towards your workout habits.</p>
            </v-flex>
          </v-flex>

          <v-flex 
            xs12 
            mt-3>
            <v-subheader>Search exercises</v-subheader>
            <v-form class="mr-3 ml-3">
              <v-autocomplete
                v-model="searchSelectedExercises"
                :items="exerciseTypes"
                item-text="name"
                item-value="name"
                placeholder="ex. Bench press"
                browser-autcomplete
                clearable
                chips
                deletable-chips
                multiple
                small-chips
                solo
                outline
                flat
                light
              />
            </v-form>

            <v-flex 
              text-xs-right 
              mr-3 
              ml-3>

              <v-btn
                color="grey"
                dark>Add custom
              </v-btn>

              <v-btn
                :disabled="!searchSelectedExercises.length"
                @click.stop="addMultiSelected"
              >Add Selected</v-btn>

            </v-flex>

            <v-flex 
              mt-3
              mr-3 
              ml-3>
              <p class="subheading grey--text text--darken-2">Search across all exercises. If you can't find what you're
              looking for you can add a custom exercise as well.</p>
            </v-flex>

          </v-flex>

        </v-layout>
      </v-card>
    </v-dialog>
  </v-flex>
</template>

<script>
import { queries, mutations } from "@/graphql";
import { showSnackbar } from "@/helpers";

import { IN_PROGRESS } from "@/constants";

export default {
  name: "CreateWorkout",

  data() {
    return {
      loading: false,
      dialog: false,
      exerciseTypes: [],
      searchSelectedExercises: [],
      selectedExercises: [],
      popularExerciseTypes: [],
      workout: null
    };
  },

  apollo: {
    exerciseTypes: {
      query: queries.exerciseTypesQuery,

      update(data) {
        return data.exerciseTypes;
      }
    },

    popularExerciseTypes: {
      query: queries.popularExerciseTypesQuery
    }
  },

  methods: {
    inSelected(exerciseId) {
      return Boolean(this.selectedExercises.find(ex => ex.id === exerciseId));
    },

    selectExercise(exercise) {
      if (this.inSelected(exercise.id)) {
        return;
      }
      this.selectedExercises = [exercise, ...this.selectedExercises];
    },

    deselectExercise(exerciseId) {
      this.selectedExercises = this.selectedExercises.filter(
        ex => ex.id !== exerciseId
      );
    },

    addMultiSelected() {
      const selectedWithIds = this.searchSelectedExercises.map(name => {
        const item = this.exerciseTypes.find(item => item.name === name);

        return {
          name,
          id: item.id
        };
      });

      this.selectedExercises = [...selectedWithIds, ...this.selectedExercises];

      this.searchSelectedExercises = [];
    },

    startWorkout() {
      const workout = this.workout;

      if (!this.selectedExercises.length) {
        showSnackbar("orange", "Uh-oh looks like you have no exercises added.");
        return;
      }

      if (!(workout && workout.id)) {
        showSnackbar(
          "error",
          "Hmm seems like there isn't an attached work out. Please create again."
        );
        return;
      }

      // Ensure matches the input type
      const normalizedSelected = this.selectedExercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name
      }));

      this.$apollo
        .mutate({
          mutation: mutations.updateWorkoutMutation,

          variables: {
            workoutId: workout.id,
            workoutFields: {
              dateStarted: new Date(),
              status: IN_PROGRESS,
              exerciseTypes: normalizedSelected
            }
          }
        })
        .then(() => {
          this.selectedExercises = [];
          showSnackbar("success", "Workout started!");
        })
        .catch(() => {
          this.selectedExercises = [];
          showSnackbar("error", "Could not start workout.");
        });
    },

    createWorkout() {
      this.loading = true;

      this.$apollo
        .mutate({
          mutation: mutations.createWorkoutMutation,

          update: (store, { data }) => {
            const newWorkout = data.createWorkout.workout;
            const result = store.readQuery({
              query: queries.workoutsQuery
            });

            // Prepend the latest workout
            result.workouts.unshift(newWorkout);

            store.writeQuery({
              query: queries.workoutsQuery,
              data: result
            });
          }
        })
        .then(resp => {
          this.loading = false;
          this.dialog = true;

          this.workout = resp.data.createWorkout.workout;
        })
        .catch(() => {
          this.loading = false;

          showSnackbar(
            "error",
            "Oops, there seems to have been a problem creating your workout."
          );
        });
    }
  }
};
</script>
