<template>
    <div>
        <h3>Controls</h3>
        <!--<b-form-group label="Dataset: ">-->
            <b-form-radio-group >
                <b-form-radio v-model="appState.dataset" name="dataset" value="work">Work</b-form-radio>
                <b-form-radio v-model="appState.dataset" name="dataset" value="study">Study</b-form-radio>
            </b-form-radio-group>
        <p>dataset: {{appState.dataset}}
        </p>
    </div>
    <!--<div id="container"></div>-->
</template>

<script>
  import * as Three from 'three'
  import appState from '@/components/AppState'


  export default {
    name: 'Controls',
    data() {
      return {
        selectedDataset: "",
        appState: appState
        // dataset: appState.dataset
      }
    },
    static() {
      return {
      }
    },
    created() {
    },
    methods: {
    },
    mounted() {
      // this.init();
      // this.animate();

    },
  }
</script>

<style scoped>
    /*.map-container {*/
    /*    margin: 1em;*/
    /*}*/

</style>
