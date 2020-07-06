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
  import * as d3 from "d3";
  import * as topojson from 'topojson-client'


  let THREE = Three;

  // https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
  // Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
  function vertex(point) {
    // var lambda = point[0] * Math.PI / 180,
    //   phi = point[1] * Math.PI / 180,
    //   cosPhi = Math.cos(phi);
    return new THREE.Vector3(
      point[0]/ 10000, point[1] / 10000, 0
    );
  }

  // https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
  // Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
  function wireframe(multilinestring, material) {
    var geometry = new THREE.Geometry;
    multilinestring.coordinates.forEach(function(line) {
      // debugger
      d3.pairs(line.map(vertex), function(a, b) {
      // d3.pairs(line, function(a, b) {
        geometry.vertices.push(a , b );
      });
    });
    return new THREE.LineSegments(geometry, material);
  }

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
        hoops: null,
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
      this.getMapData()
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

        this.hoops = [];


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

        // for(let hoop of this.hoops) {
        //   hoop.geometry.rotateY(delta)
        // }

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
      getMapData() {
        axios.get("/nz_topojson_simplified.json").then(response => {
          console.log("got topojson")
          let topology=response.data
          let mesh = wireframe(topojson.mesh(topology, topology.objects["statistical-area-2-2018-generalised"]), new THREE.LineBasicMaterial({color: '#223627'}));
          this.scene.add(mesh)
        })
      },
      getEducationData() {
        this.isLoading = true

        // let geometry = new Three.TorusGeometry(10, 1, 16, 20);
        // geometry.rotateX(Math.PI / 2)
        let material = new Three.MeshBasicMaterial({color: 0xffff00});

        let self = this

        self.hoops = new Array;

        let mergedGeometry = new Three.Geometry;

        papa.parse('/education.csv', {
          download: true,
          header: true,
          step: function (row) {
            // debugger
            if (row.data.Total < 40) {
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
            // let geometry = new Three.TorusBufferGeometry(hy/2, row.data.Total / 5000, 8, 10, Math.PI);
            let geometry = new Three.TorusGeometry(hy/2, row.data.Total / 5000, 8, 10, Math.PI);
            // geometry = new Three.WireframeGeometry(geometry)
            geometry.rotateX(Math.PI / 2)

            // let mesh = new Three.Mesh(geometry.scale(0.5, 0.5, 0.5), material);
            let mesh = new Three.Mesh(geometry, material);

            // mesh.scale.set(scale, scale, scale);
            mesh.rotateZ(theta)

            mesh.position.x = midpoint.x
            mesh.position.y = midpoint.y
            mesh.position.z = 0;

            mergedGeometry.mergeMesh(mesh);

            self.hoops.push(mesh);
            // self.scene.add(mesh);
          },
          complete: function() {

            self.scene.add(new Three.Mesh(mergedGeometry, material));
            // this.renderer.render(this.scene, this.camera);
          }
        });

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
