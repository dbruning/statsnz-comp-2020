<template>
    <div>
        <h3>CommuterView</h3>
        <h5>2018 Census data</h5>
        <b-form-group label="Dataset:" >
            <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                <b-form-radio v-model="appState.dataset" name="dataset" value="work">Work</b-form-radio>
                <b-form-radio v-model="appState.dataset" name="dataset" value="study">Study</b-form-radio>
            </b-form-radio-group>
        </b-form-group>

        <b-form-group label="Data detail:">
            <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                <b-form-radio v-model="appState.dataDetail" name="dataset" value="low">Low</b-form-radio>
                <b-form-radio v-model="appState.dataDetail" name="dataset" value="med">Med</b-form-radio>
                <b-form-radio v-model="appState.dataDetail" name="dataset" value="high">High</b-form-radio>
            </b-form-radio-group>
        </b-form-group>

        <!--<b-form-group label="Graphics detail:">-->
        <!--    <b-form-radio-group buttons button-variant="outline-primary" size="sm">-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="low">Low</b-form-radio>-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="med">Med</b-form-radio>-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="high">High</b-form-radio>-->
        <!--    </b-form-radio-group>-->
        <!--</b-form-group>-->

        <b-btn variant="primary" class="load-button" @click="loadClicked">Load</b-btn>

    </div>
</template>

<script>
  import appState from '@/components/AppState'


  export default {
    name: 'Controls',
    data() {
      return {
        appState: appState,
      }
    },
    created() {
    },
    methods: {
      loadClicked() {
        this.$root.$emit('load')
      }
    },
    mounted() {
      let self = this;
    },
  }
</script>

<style>
    .load-button, .full-width {
        width: 100%;
    }
</style>

