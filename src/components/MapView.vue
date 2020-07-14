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
  import {makePolygons} from "./mapPolygonsLayer";
  import {addMapEdgesToScene} from "./mapEdgesLayer";
  import {MapControls} from "three/examples/jsm/controls/OrbitControls";
  import {addVisualisationData, getRegionData} from "./visualisationLayer";
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
        highlightedRegionPolygon: null,
        highlightedRegionHops: [],
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
          // We keep area polygons around mainly to detect clicks with - only the edges (below) are drawn
          this.areaPolygons = makePolygons(response.data)

          // Detect clicks on those area polygons
          detectClicks(this.renderer.domElement, this.camera, this.areaPolygons, this.$root)

          // Draw the edges of the regions
          addMapEdgesToScene(response.data, this.scene)

        })
      },
      setVisualisationVisibility(isVisible) {
        for (let m of this.visualisationData) {
          m.visible = isVisible
        }
      }
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


      this.$root.$on('regionClicked', function (data) {
        let isUnclick = false
        if (self.highlightedRegionPolygon != null) {
          if (self.highlightedRegionPolygon.userData.SA22018__1 == data.SA22018__1) {
            isUnclick = true
          }
        }

        // Remove any previously-highlighted polygon & hops
        if (self.highlightedRegionPolygon) self.scene.remove(self.highlightedRegionPolygon)
        self.highlightedRegionPolygon = null
        for (let hop of self.highlightedRegionHops) {
          self.scene.remove(hop)
        }
        self.highlightedRegionHops.length = 0;

        // Hide country-wide hops
        self.setVisualisationVisibility(isUnclick)
        self.appState.highlightedRegionName = ""

        // If it was an unclick, we're done
        console.log("isUnclick?", isUnclick)
        if (isUnclick) return;

        // Run through our data to find rows (& make hoops) relating to that region
        let regionName = data.SA22018__1
        let regionData = getRegionData(regionName, appState, self.areaPolygons)

        // Set appState data, for rendering on right-hand side of map
        self.appState.highlightedRegionName = regionName
        self.appState.highlightedRegionMovementData = regionData.movementData

        // Highlight the selected region as a polygon
        if (regionData.areaPolygon) {
          self.highlightedRegionPolygon = regionData.areaPolygon
          self.scene.add(self.highlightedRegionPolygon)
        }

        // Add any hops into/out of that region
        if (regionData.hops) {

          for (let hop of regionData.hops) {
            self.highlightedRegionHops.push(hop)
            self.scene.add(hop)
          }
        }

        // console.log("Region clicked:", data)

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
