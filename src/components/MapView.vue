<template>
    <div>
        <!--<div id="map-container" style="height:600px"></div>-->
        <div id="map-container"></div>
    </div>
</template>

<script>
  import * as Three from 'three'
  import axios from 'axios'

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
        container: null,
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
      window.addEventListener("resize", this.handleWindowResize);
    },
    destroyed() {
      window.removeEventListener("resize", this.handleWindowResize);
    },

    methods: {
      init: function () {
        let self = this
        let container = this.container = document.getElementById('map-container');

        this.mapMeshes = []
        this.areaPolygons = []

        let height = this.calculateIdealMapHeight()
        this.clock = new Three.Clock();
        this.camera = new Three.PerspectiveCamera(70, container.clientWidth / height, 0.01, 10000);
        this.scene = new Three.Scene();

        this.chunks = [];

        let globalPlane = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0.01 );

        this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer.setSize(container.clientWidth, height);
        this.renderer.clippingPlanes = [globalPlane]
        container.appendChild(this.renderer.domElement);

        this.camera.position.set(0, 0, 100);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 0, 1);

        let controls = this.controls = new MapControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = 1;
        controls.maxDistance = 500;

        // controls.minAzimuthAngle = 0.05 * Math.PI;
        // controls.maxAzimuthAngle = 0.95 * Math.PI;
        // controls.minPolarAngle = 0.05 * Math.PI;
        // controls.maxPolarAngle = 0.95 * Math.PI;
        controls.maxPolarAngle =  Math.PI / 2;

        let light = new THREE.DirectionalLight(0xffffff);
        light.position.set(0, -1, 1).normalize();
        this.scene.add(light);
        let ambientLight = new THREE.AmbientLight(0x404040); // soft white light
        this.scene.add(ambientLight);

      },
      handleWindowResize(event) {
        console.log("Window resize:", event)
        let height = this.calculateIdealMapHeight()
        this.renderer.setSize(this.container.clientWidth, height);
        this.camera.aspect = this.container.clientWidth / height;
        this.camera.updateProjectionMatrix();
      },
      calculateIdealMapHeight() {
        let mapViewElement = document.querySelector(".map-view")
        let controlColumnElement = document.querySelector(".control-column")
        let mapViewBox = mapViewElement.getBoundingClientRect();
        let controlColumnBox = controlColumnElement.getBoundingClientRect();

        if (controlColumnBox.left > mapViewBox.right)  {
          // Control column is on right-hand side of map - map height can be pretty much full screen
          return window.innerHeight - (2 * 16);
        } else {
          // Control column is down below (e.g. on a phone)
          // - map height is less, make sure user can see some of the heading & grab it to scroll down
          return window.innerHeight - 80;
        }

      },
      animate: function () {
        // snip
        const delta = this.clock.getDelta();

        if (delta > 0) {
          this.appState.frameRate = (this.appState.frameRate * 10 + (1 / delta)) / 11
        }

        if (this.highlightedRegionPolygon != null) {
          for(let m of this.highlightedRegionHops) {
            m.geometry.rotateY(delta)
          }
        }

        requestAnimationFrame(this.animate);

        this.controls.update()

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
      },
      unhighlight() {
        let self = this
        // Remove any previously-highlighted polygon & hops
        if (self.highlightedRegionPolygon) self.scene.remove(self.highlightedRegionPolygon)
        self.highlightedRegionPolygon = null
        for (let hop of self.highlightedRegionHops) {
          self.scene.remove(hop)
        }
        self.highlightedRegionHops.length = 0;

        // Unset the highlighted region name
        self.appState.highlightedRegionName = ""

        // Show normal country-wide hops
        self.setVisualisationVisibility(true)

      }
    },
    mounted() {
      this.init();
      this.animate();
      let self = this;

      // Get visualisation data when we know which dataset to load
      this.$root.$on("load", function () {
        self.unhighlight()

        // Remove any existing visualisation data
        if (self.visualisationData && self.visualisationData.length) {
          for (let vd of self.visualisationData) {
            self.scene.remove(vd);
          }
        }
        self.visualisationData.length = 0;

        // Add new visualisation data
        addVisualisationData(self.scene, self.appState, self.visualisationData, function() {
          // Render on each progress callback
          // console.log("progressCallback, going to render")
          self.renderer.render(self.scene, self.camera);
        })
      })

      this.$root.$on('removeHighlight', function () {
        self.unhighlight();
      })

      this.$root.$on('regionClicked', function (data) {
        // See if this is an "unclick", i.e. click on an already-selected region
        let isUnclick = false
        if (self.highlightedRegionPolygon != null) {
          if (self.highlightedRegionPolygon.userData.SA22018__1 == data.SA22018__1) {
            isUnclick = true
          }
        }

        // Always unhighlight, we'll potentially apply highlight again later
        self.unhighlight();

        // If it was an unclick, we're done
        if (isUnclick) return;

        // Not an unclick - hide the normal countrywide hops
        self.setVisualisationVisibility(false)

        // Run through our data to find rows (& make hoops) relating to that region
        let regionName = data.SA22018__1
        let regionData = getRegionData(regionName, self.appState, self.areaPolygons)

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
        border: 1px solid #42b983;
        border-radius: 2px;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }

</style>
