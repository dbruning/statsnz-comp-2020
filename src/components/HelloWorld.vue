<template>
    <div id="container" style="width:600px;height:600px"></div>
</template>

<script>
  import * as Three from 'three'
  import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
  import {FlyControls} from "three/examples/jsm/controls/FlyControls";
  import {DragControls} from "three/examples/jsm/controls/DragControls";
  import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
  import CameraControls from 'camera-controls';
  import axios from 'axios'
  import * as papa from 'papaparse'

  CameraControls.install({THREE: Three});
  // import educationData from "../assets/education.csv";

  export default {
    name: 'ThreeTest',
    data() {
      return {
        isLoading: false
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
        hasEverRendered: null,
        minNorthing: null,
        maxNorthing: null,
        midNorthing: null,
        minEasting: null,
        maxEasting: null,
        midEasting: null,

      }
    },
    created() {
      this.getEducationData()
    },
    methods: {
      init: function () {
        let container = document.getElementById('container');

        this.minNorthing = 470;
        this.maxNorthing = 620;
        this.minEasting = 115;
        this.maxEasting = 250;
        this.midNorthing = (this.maxNorthing + this.minNorthing) / 2;
        this.midEasting = (this.maxEasting + this.minEasting) / 2;

        this.clock = new Three.Clock();
        this.camera = new Three.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 1, 10000);
        // this.camera.lookAt(this.midEasting, this.midNorthing, 0)
        // this.camera.up.set(0, 0, 1)
        // this.camera.up.set(0, 1, 0)
        // this.camera.position.set(170, 470, -1500);
        // this.camera.position.set(170, 529, 0.0005);
        // this.camera.position.set(0, 0, 1500);
        // this.camera.lookAt(this.midEasting, this.midNorthing * 10.5, 0);
        // console.log("setting camera position", this.camera.position.x, this.camera.position.y, this.camera.position.z)
        // this.camera.position.y = this.midNorthing + 600;
        // this.camera.position.z = 600;

        this.scene = new Three.Scene();

        const gridHelper = new Three.GridHelper( 100, 100 );
        // gridHelper.position.y = - 1;
        gridHelper.rotateX(Math.PI / 2);
        this.scene.add( gridHelper );

        const mesh = new Three.Mesh(
          new Three.BoxGeometry( 1, 1, 1 ),
          new Three.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
        );
        this.scene.add( mesh );


        this.renderer = new Three.WebGLRenderer({antialias: true});
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        let midX = 170
        let midY = 550

        gridHelper.translateX(midX)
        gridHelper.translateY(midY)

        // this.camera.up.set( 0, 1, 0 );
        this.camera.position.set( midX, midY,  100);
        this.camera.up.set( 0, 1, 0 );
        // this.camera.lookAt(0, 50, 0);

        // https://github.com/yomotsu/camera-controls
        this.controls = new CameraControls(this.camera, this.renderer.domElement);
        this.controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
        this.controls.mouseButtons.right = CameraControls.ACTION.ROTATE;
        this.controls.dollySpeed = 0.3;
        // let height = 10
        this.controls.setTarget(midX, midY, 0)
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
        const hasControlsUpdated = this.controls.update(delta);

        requestAnimationFrame(this.animate);

        // console.log("hasever: ", this.hasEverRendered)
        // let p;
        // let position = this.controls.getPosition({});
        // console.log("Camera position: ",position)
        // console.log("Camera position: ",this.controls._position0)
        // if (hasControlsUpdated || !this.hasEverRendered) {
          this.renderer.render(this.scene, this.camera);
          // console.log("Controls: ",this.controls)
          // this.hasEverRendered = true;
        // }
      },
      getEducationData() {
        this.isLoading = true

        // let geometry = new Three.TorusGeometry(10, 1, 16, 20);
        // geometry.rotateX(Math.PI / 2)
        let material = new Three.MeshBasicMaterial({color: 0xffff00});

        let self = this

        papa.parse('/education.csv', {
          download: true,
          header: true,
          step: function (row) {
            // debugger
            if (row.data.Total < 50) {
              // console.log('returning early')
              return;
            } else {
              // console.log("not returning: " + row.data.total)
            }

            let from = {
              x: row.data.SA2_usual_residence_easting / 10000,
              y: row.data.SA2_usual_residence_northing / 10000
            }
            let to = {
              x: row.data.SA2_educational_easting / 10000,
              y: row.data.SA2_educational_northing / 10000
            }
            let midpoint = {
              x: (from.x + to.x) / 2,
              y: (from.y + to.y) / 2
            }
            // console.log("from, to, midpoint:", from, to, midpoint)
            let op = from.y - to.y;
            let ad = from.x - to.x;
            let theta = Math.atan(op/ad);
            let hy = Math.sqrt(Math.pow(op, 2) + Math.pow(ad, 2)) * 1
            let scale = hy

            // Get rid of anything "boring" - not much distance and not much volume
            // if (hy < 50 ||row.data.Total < 180 ) {
            //   return
            // }

            // console.log("plotting row data", row.data)
            let geometry = new Three.TorusGeometry(hy/2, row.data.Total / 5000, 16, 20, Math.PI);
            geometry.rotateX(Math.PI / 2)

            // let mesh = new Three.Mesh(geometry.scale(0.5, 0.5, 0.5), material);
            let mesh = new Three.Mesh(geometry, material);

            // mesh.position.x = Math.random() * 500;
            // mesh.scale(0.5, 0.5, 0.5);
            // mesh.position.y = minNorthing + (maxNorthing - minNorthing) * Math.random();
            //   mesh.position.y = Math.random() * 100
            // debugger;
            // console.log("setting mesh position: ", mesh.position.x, mesh.position.y, mesh.position.z)

            // console.log("adding coord at x, y", mesh.position.x, mesh.position.y)
            // mesh.position.y = 4700 + 800 * Math.random();
            // mesh.position.z = Math.random() * 100
            // mesh.rotateX(Math.random() * 3);

            // mesh.scale.set(scale, scale, scale);
            mesh.rotateZ(theta)

            mesh.position.x = midpoint.x
            mesh.position.y = midpoint.y
            mesh.position.z = 0;

            self.scene.add(mesh);
            // complete: function(results) {
            //   console.log(results);
            // }

          },
          complete: function() {
            this.renderer.render(this.scene, this.camera);
          }
        });


        //   response.data, {relax: true}, function (data) {
        //   console.log("data")
        //   // return data.map(function (value) {
        //   //   return value.toUpperCase()
        //   // });
        // }, function (err, data) {
        //   console.log("error downloading data")
        // });
        // });
      }
      // import("../assets/education.csv").then(data => {
      //   debugger;
      //   console.log("data")
      //   // csv.parse(data, function(err, data){
      //   //   console.log("data")
      //   // })
      // })
      //   csv.stringify(data, function(err, data){
      //     process.stdout.write(data);
      //   });
      // });
      //
      //
      //   console.log("got data")
      // }
    },
    mounted() {
      this.init();
      this.animate();

    },
  }
</script>

<style scoped>
</style>
