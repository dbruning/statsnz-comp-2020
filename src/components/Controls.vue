<template>
    <div>
        <h3>Controls</h3>
        <!--<b-form-group label="Dataset: ">-->
            <b-form-radio-group >
                <b-form-radio v-model="selectedDataset" name="dataset" value="work">Work</b-form-radio>
                <b-form-radio v-model="selectedDataset" name="dataset" value="study">Study</b-form-radio>
            </b-form-radio-group>
    </div>
    <!--<div id="container"></div>-->
</template>

<script>
  import * as Three from 'three'


  export default {
    name: 'Controls',
    data() {
      return {
        selectedDataset: ""
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
