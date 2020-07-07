<template>
  <div id="app">
    <b-container>
      <b-row>
        <b-col cols="12" md="9">
          <MapView/>
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


export default {
  name: 'App',
  components: {
    MapView
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
