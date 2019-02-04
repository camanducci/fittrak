<template>
  <v-card
    :color="white"
    @click.stop="viewWorkout"
  >
    <v-card-title primary-title> 
      <span class="headline">{{ timeAgo }} <span class="subheading grey--text text--darken-1">(on {{ started }})</span></span>
    </v-card-title>

    <v-divider light />

    <v-card-text>
      <span class="subheading">Highlights</span>
      <v-layout 
        row 
        ma-1>
        <v-flex 
          class="subheading grey--text text--darken-2" 
          md6 
          xs12>
          <div> 
            Time Spent:
          </div>
          <div>
            Total Weight:
          </div>
          <div>
            Type:
          </div>
          <div>
            Exercises:
          </div>
        </v-flex>

        <v-flex 
          class="subheading"
          md6 
          xs12
        >
          <div>120min</div>
          <div>250lbs</div>
          <div>Custom</div>
          <div>{{ workout.exerciseCount }}</div>
        </v-flex>
      </v-layout>

    </v-card-text>

    <div class="status">
      <v-chip 
        label 
        v-bind="{[`color`]: statusColor }"
        dark
      >
        <v-icon left>{{ statusIcon }}</v-icon>
        {{ getHumanStatus }}
      </v-chip>
    </div>

    <v-divider light />

    <v-card-actions>
      <v-toolbar 
        flat 
        light
        color="white"
      >

        <v-btn 
          class="grey--text text--darken-2"
          icon>
          <v-icon>share</v-icon>
        </v-btn>

        <v-spacer />

        <v-btn 
          class="grey--text text--darken-2"
          icon>
          <v-icon>favorite</v-icon>
        </v-btn>
        <v-btn 
          class="grey--text text--darken-2"
          @click.stop="removeWorkout"
          icon>
          <v-icon>delete</v-icon>
        </v-btn>
      </v-toolbar>
    </v-card-actions>

  </v-card>
</template>

<script>
import { mutations } from "@/graphql";
import {
  STATUS_MAP,
  PENDING,
  COMPLETE,
  IN_PROGRESS,
  CANCELLED
} from "@/constants";

import { getStatusColor } from "@/helpers";

import { format, distanceInWords } from "date-fns";

export default {
  name: "WorkoutCard",

  computed: {
    // Human friendly status
    getHumanStatus: data => {
      return STATUS_MAP[data.workout.status];
    },

    started: data => {
      return format(data.workout.dateStarted, "YYYY-MM-DD [@] h:MMA");
    },

    timeAgo: data => {
      return distanceInWords(new Date(), data.workout.dateStarted, {
        addSuffix: true
      });
    },

    statusColor: data => {
      return getStatusColor(data.workout.status);
    },

    ended: data => {
      if (data.workout.dateEnded) {
        return format(data.workout.dateEnded, "YYYY-MM-DD [@] h:MMA");
      }

      return "∞";
    },

    statusIcon: data => {
      return {
        [PENDING]: "hourglass_empty",
        [IN_PROGRESS]: "hourglass_full",
        [CANCELLED]: "cancel",
        [COMPLETE]: "check_circle"
      }[data.workout.status];
    },

    borderColor: data => {
      return `5px solid ${data.workout.color}`;
    },

    relativeDarkness: data => {
      const { color } = data.workout;

      const textColor = `${color}--text`;
      const textColorDarkened = "text--darken-4";

      return {
        [textColor]: true,
        [textColorDarkened]: true
      };
    }
  },

  methods: {
    removeWorkout() {
      const workoutId = this.$props.workout.id;

      this.$apollo.mutate({
        mutation: mutations.RemoveWorkout,

        variables: {
          workoutId
        }

        /*
        update(store) {
          const data = store.readQuery({
            query: query.WorkoutsQuery
          });

          const filteredWorkouts = data.workouts.filter(
            wrk => wrk.id !== workoutId
          );

          data.workouts = filteredWorkouts;

          store.writeQuery({
            query: query.WorkoutsQuery,
            data
          });
        }
        */
      });
    },

    viewWorkout() {
      const workoutId = this.$props.workout.id;

      this.$router.push(`/workouts/${workoutId}`);
    }
  },

  props: {
    workout: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
div.status {
  position: absolute;
  right: -10px;
  top: -11px;
}
</style>
