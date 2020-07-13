<template>
    <div>
        <div id="map-container" style="height:600px"></div>
    </div>
</template>

<script>
  import * as Three from 'three'
  // import CameraControls from 'camera-controls';
  import axios from 'axios'
  import * as papa from 'papaparse'

  import appState from '@/components/AppState'
  import { makePolygons} from "./mapPolygonsLayer";
  import {addMapEdgesToScene} from "./mapEdgesLayer";
  import {MapControls} from "three/examples/jsm/controls/OrbitControls";
  import {addVisualisationData} from "./visualisationLayer";
  import {detectClicks} from "./clickDetector";

  let THREE = Three;

  export default {
    name: 'ThreeTest',
    data() {
      return {
        isLoading: false,
        appState: appState
      }
    },
    static() {
      return {
        clock: null,
        camera: null,
        scene: null,
        controls: null,
        renderer: null,
        mesh: null,
        areaPolygons: null,
        mapMeshes: null,
        chunks: null,
        hasEverRendered: null,
        visualisationData: []
      }
    },
    created() {
      // Get map data as soon as created
      this.getMapData()
    },
    methods: {
      init: function () {
        let self = this
        let container = document.getElementById('map-container');

        this.mapMeshes = []
        this.areaPolygons = []

        this.clock = new Three.Clock();
        this.camera = new Three.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.01, 10000);
        this.scene = new Three.Scene();

        this.chunks = [];

        this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);


        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);


        let controls = this.controls = new MapControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = true;

        controls.minDistance = 1;
        controls.maxDistance = 500;

        // controls.minAzimuthAngle = 0.05 * Math.PI;
        // controls.maxAzimuthAngle = 0.95 * Math.PI;
        controls.minPolarAngle = 0.05 * Math.PI;
        controls.maxPolarAngle = 0.95 * Math.PI;

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, 1, 1).normalize();
        this.scene.add(light);
        let ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(ambientLight);

      },
      animate: function () {
        // snip
        const delta = this.clock.getDelta();
        // console.log(delta)
        // const hasControlsUpdated = this.controls.update(delta);
        this.controls.update()

        if (delta > 0) {
          this.appState.frameRate = (this.appState.frameRate * 10 + (1 / delta)) / 11
        }

        requestAnimationFrame(this.animate);

        // for(let hoop of this.hoops) {
        //   hoop.geometry.rotateY(delta)
        // }

        this.renderer.render(this.scene, this.camera);
      },
      getMapData() {
        axios.get("/nz_topojson_simplified.json").then(response => {
          // console.log("got topojson")
          // let topology = response.data
          // let nzMesh = topojson.mesh(topology, topology.objects["statistical-area-2-2018-generalised"])


          this.areaPolygons = makePolygons(response.data)
          // for(let p of this.areaPolygons) {
          //   this.scene.add(p)
          // }
          detectClicks(this.renderer.domElement, this.camera, this.areaPolygons, this.$root)

          addMapEdgesToScene(response.data, this.scene)

        })
      },
    },
    mounted() {
      this.init();
      this.animate();
      let self = this;

      // Get visualisation data when we know which dataset to load
      this.$root.$on("load", function () {
        // Remove any existing visualisation data
        if (self.visualisationData && self.visualisationData.length) {
          for (let vd of self.visualisationData) {
            self.scene.remove(vd);
          }
        }

        // Add new visualisation data
        self.visualisationData = addVisualisationData(self.scene, self.appState)
      })

    },
  }
</script>

<style>
    .map-container {
        margin: 1em;
    }

    canvas {
        border: 1px solid grey;
        border-radius: 2px;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }

</style>
