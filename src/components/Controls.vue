<template>
    <div>
        <h3>CommuterView</h3>
        <h5>2018 Census data</h5>
        <b-form-group label="Dataset:" >
            <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                <b-form-radio v-model="dataset" name="dataset" value="work">Work</b-form-radio>
                <b-form-radio v-model="dataset" name="dataset" value="study">Study</b-form-radio>
            </b-form-radio-group>
        </b-form-group>

        <b-form-group label="Data detail:">
            <b-form-radio-group buttons button-variant="outline-primary" size="sm" class="full-width">
                <b-form-radio v-model="dataDetail" name="dataset" value="low">Low</b-form-radio>
                <b-form-radio v-model="dataDetail" name="dataset" value="med">Med</b-form-radio>
                <b-form-radio v-model="dataDetail" name="dataset" value="high">High</b-form-radio>
            </b-form-radio-group>
        </b-form-group>

        <!--<b-form-group label="Graphics detail:">-->
        <!--    <b-form-radio-group buttons button-variant="outline-primary" size="sm">-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="low">Low</b-form-radio>-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="med">Med</b-form-radio>-->
        <!--        <b-form-radio v-model="appState.graphicsDetail" name="dataset" value="high">High</b-form-radio>-->
        <!--    </b-form-radio-group>-->
        <!--</b-form-group>-->

        <b-btn variant="primary" class="load-button" @click="loadClicked" v-if="canLoad && !appState.isLoadingVisualisation">Load</b-btn>

        <!--<b-progress max="100" v-if="appState.progressTask.length" variant="primary">-->
        <!--    <b-progress-bar :value="appState.progressPercent" :label="`${appState.progressTask}%`"></b-progress-bar>-->
        <!--</b-progress>-->

        <div class="progress-line" v-if="appState.progressTask.length">
            <div>{{appState.progressTask}}</div>
            <div>{{Math.ceil(appState.progressPercent) }}%</div>

        </div>

    </div>
</template>

<script>
  import appState from '@/components/AppState'

  // appState.progressTask = "testing"
  // appState.progressPercent= 5


  export default {
    name: 'Controls',
    data() {
      return {
        appState: appState,
        dataset: null,
        dataDetail: null,
      }
    },
    created() {
    },
    methods: {
      loadClicked() {
        this.$root.$emit('load')
      }
    },
    computed: {
      canLoad: function() {return (this.dataset != null) && (this.dataDetail != null)}
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
    .progress-line {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
</style>

