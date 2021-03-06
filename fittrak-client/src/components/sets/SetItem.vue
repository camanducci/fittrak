<template>
  <v-list-tile v-if="!editing">
    <v-list-tile-content>
      <v-list-tile-title>{{ repetitions }} x {{ weight }} {{ unit }} <span v-if="bodyweight">(BW)</span>
      </v-list-tile-title>
    </v-list-tile-content>

    <v-list-tile-action>
      <v-btn 
        small 
        flat 
        color="info" 
        icon 
        @click.stop="editSet">
        <v-icon>edit</v-icon>
      </v-btn>
    </v-list-tile-action>

    <v-list-tile-action>
      <v-btn 
        small 
        flat 
        color="info" 
        icon 
        @click.stop="removeSet">
        <v-icon>delete</v-icon>
      </v-btn>
    </v-list-tile-action>
  </v-list-tile>
  <v-flex v-else>
    <v-layout 
      row 
      wrap>
      <v-flex xs12>
        <v-text-field 
          v-model="repetitions" 
          placeholder="Reps" 
          type="number" />
      </v-flex>

      <v-flex xs12>
        <v-text-field 
          v-model="weight" 
          placeholder="Weight" 
          type="number" />
      </v-flex>

      <v-flex xs12>
        <v-radio-group 
          v-model="unit" 
          row 
          class="mt-3">
          <v-radio 
            color="primary" 
            label="LB" 
            value="LB" />
          <v-radio 
            color="primary" 
            label="KG" 
            value="KG" />
        </v-radio-group>
      </v-flex>

      <v-flex xs12>
        <v-checkbox 
          v-model="bodyweight" 
          color="primary" 
          label="Using bodyweight"/>
      </v-flex>

      <v-flex 
        xs12 
        text-xs-right 
        mt-3 
        mb-3>
        <v-btn 
          small 
          outline 
          color="gray" 
          @click.stop="editing = false">Cancel</v-btn>
        <v-btn 
          small 
          depressed 
          color="success" 
          @click.stop="updateSet">Save</v-btn>
      </v-flex>
    </v-layout>

  </v-flex>
</template>

<script>
import { queries, mutations } from "@/graphql";

import { showSnackbar } from "@/helpers";

export default {
  name: "SetItem",

  data() {
    const { set } = this.$props;

    return {
      editing: false,
      weight: set.weight,
      repetitions: set.repetitions,
      unit: set.unit,
      bodyweight: set.bodyweight
    };
  },

  methods: {
    editSet() {
      this.editing = true;
    },

    removeSet() {
      const set = this.set;

      this.$apollo
        .mutate({
          mutation: queries.RemoveSetMutation,
          variables: {
            setId: set.id
          },
          update(store, { data }) {
            const set = data.removeSet.set;

            const result = store.readQuery({
              query: queries.SetsQuery,
              variables: {
                exerciseId: set.exercise.id
              }
            });

            result.sets = result.sets.filter(s => s.id !== set.id);

            store.writeQuery({
              query: queries.SetsQuery,
              variables: {
                exerciseId: set.exercise.id
              },
              data: result
            });
          }
        })
        .then(() => {
          showSnackbar("success", "Set removed");
        })
        .catch(() => {
          showSnackbar(
            "error",
            "Could not remove Set. Support has been notified."
          );
        });
    },

    updateSet() {
      const set = this.set;
      const { weight, unit, repetitions, bodyweight } = this;

      this.$apollo
        .mutate({
          mutation: mutations.updateSetMutation,
          variables: {
            setId: set.id,
            setFields: {
              weight,
              repetitions,
              unit,
              bodyweight
            }
          }
        })
        .then(() => {
          this.editing = false;

          showSnackbar("success", "Set updated.");
        })
        .catch(() => {
          showSnackbar(
            "error",
            "Could not update Set. Support has been notified."
          );
        });
    }
  },

  props: {
    set: {
      type: Object,
      required: true
    }
  }
};
</script>
