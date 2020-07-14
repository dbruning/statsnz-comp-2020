<template>
    <div id="app">
        <b-container fluid>
            <!--<b-row>-->
            <!--    <b-col>-->
            <!--        <h1>Commuter View 2020</h1>-->
            <!--    </b-col>-->
            <!--</b-row>-->
            <b-row>
                <b-col cols="12" md="9">
                    <!--<div class="map-view-outer">-->
                        <MapView class="map-view"/>
                    <!--</div>-->
                </b-col>
                <b-col cols="12" md="3" class="control-column">
                    <Controls></Controls>
                    <RegionDetail></RegionDetail>
                    <!--<PerfStats></PerfStats>-->
                </b-col>
            </b-row>
        </b-container>
        <!--<img alt="Vue logo" src="./assets/logo.png">-->
    </div>
</template>

<script>
  import MapView from './components/MapView.vue'
  import Controls from './components/Controls.vue'
  import PerfStats from './components/PerfStats.vue'

  import AppState from './components/AppState.js'

  // Import our custom scss file
  import './custom.scss'
  import RegionDetail from "./components/RegionDetail";


  // import Vue from 'vue'
  // let appState = new Vue({
  //   data: AppState
  // })

  export default {
    name: 'App',
    components: {
      MapView, Controls,
      // PerfStats,
      RegionDetail
    }
  }
</script>

<style>
    body {
        background: black;
        color: aqua;
    }

    .map-view-outer {
        padding: 1em;
        margin: 1em;
        border: 2px solid #42b983;
        border-radius: 5px;
    }

    #app {
        /*font-family: Avenir, Helvetica, Arial, sans-serif;*/
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        /*text-align: center;*/
        color: #42b983;
        margin-top: 1em;
    }

    .control-column {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

    }
</style>
