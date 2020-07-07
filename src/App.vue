<template>
    <div id="app">
        <b-container>
            <b-row>
                <b-col>
                    <h1>Commuter View 2020</h1>
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="12" md="9">
                    <div class="map-view-outer">
                        <MapView class="map-view"/>
                    </div>
                </b-col>
                <b-col cols="12" md="3">
                    Controls
                </b-col>
            </b-row>
        </b-container>
        <!--<img alt="Vue logo" src="./assets/logo.png">-->
    </div>
</template>

<script>
  import MapView from './components/MapView.vue'

  // Import our custom scss file
  import './custom.scss'


  export default {
    name: 'App',
    components: {
      MapView
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
        text-align: center;
        color: #42b983;
        margin-top: 60px;
    }
</style>
