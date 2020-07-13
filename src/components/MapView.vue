<template>
    <div>
        <div id="map-container" style="height:600px"></div>
        <p> Dataset: {{appState.dataset}}</p>

    </div>
</template>

<script>
  import * as Three from 'three'
  // import CameraControls from 'camera-controls';
  import axios from 'axios'
  import * as papa from 'papaparse'

  import appState from '@/components/AppState'
  import {featuresToGeometry, makePolygons} from "./mapPolygonsLayer";
  import {eastingToMap, northingToMap} from "./nz";
  import {addMapEdgesToScene} from "./mapEdgesLayer";
  import * as topojson from "topojson-client";
  import {MapControls} from "three/examples/jsm/controls/OrbitControls";
  import {addVisualisationData} from "./visualisationLayer";

  let THREE = Three;

  // CameraControls.install({THREE: Three});

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

        // const gridHelper = new Three.GridHelper(100, 100);
        // gridHelper.rotateX(Math.PI / 2);
        // this.scene.add(gridHelper);

        // const mesh = new Three.Mesh(
        //   new Three.BoxGeometry(1, 1, 1),
        //   new Three.MeshBasicMaterial({color: 0xff0000, wireframe: true})
        // );
        // this.scene.add(mesh);

        this.chunks = [];


        // this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        container.addEventListener("click", (event) => {
          let rect = container.getBoundingClientRect();

          // container.setAttribute("style", "border: 1px solid red")

          // console.log("click: ", event)
          let mouse3D = new THREE.Vector3(
            ( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1,
            - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1,
            0.1 );

          let raycaster =  new THREE.Raycaster();
          raycaster.setFromCamera( mouse3D, self.camera );

          // console.log("areaPolygons", self.areaPolygons);
          let intersects = raycaster.intersectObjects( self.areaPolygons);
          if (intersects.length) {
            var mesh = intersects[0]
            console.log("clicked on:", mesh.object.userData.SA22018__1)
            // mesh.object.visible = false;
            // debugger
            // mesh.material.color.set("blue")
          }

        }, false);


        // let midX = 170
        // let midY = 550
        //
        // gridHelper.translateX(midX)
        // gridHelper.translateY(midY)

        // this.camera.up.set( 0, 1, 0 );
        this.camera.position.set(0, 0, 100);
        // this.camera.up.set(0, 1, 0);
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
        // this.mouseButtons.LEFT = THREE.MOUSE.PAN;
        // this.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        //
        // this.touches.ONE = THREE.TOUCH.PAN;
        // this.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;

        // // https://github.com/yomotsu/camera-controls
        // this.controls = new CameraControls(this.camera, this.renderer.domElement);
        //
        // // Set mouse controls
        // this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        // this.controls.mouseButtons.right = CameraControls.ACTION.ROTATE;
        // // this.controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
        // this.controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
        //
        // // Set touch controls
        // this.controls.touches.one = CameraControls.ACTION.TDOLLY;
        // this.controls.dollySpeed = 0.3;
        // let height = 10
        // this.controls.setTarget(midX, midY, 0)
        // this.controls.moveTo(midX, midY, height)
        // this.controls.distance = 200;
        // this.controls.setLookAt = (
        //   midX, midY, height,
        //     midX, midY, 0,
        //     true
        // )
        // this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        // this.controls = new FlyControls(this.camera, this.renderer.domElement);
        // this.controls = new DragControls(this.camera, this.renderer.domElement);

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
        addVisualisationData(self.scene, self.appState)
      })

    },
  }
</script>

<style >
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
