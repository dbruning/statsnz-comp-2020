import * as Three from "three";
import * as papa from "papaparse";
import {eastingToMap, northingToMap} from "./nz";

let THREE = Three

let chunks = [];

export function addVisualisationData(scene, appState) {
  // let material = new Three.MeshBasicMaterial({color: 0xffff00});
  let material = new Three.MeshPhongMaterial({color: 0xffff00});
  let ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light

  scene.add( ambientLight );

  let light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 1, 1 ).normalize();
  scene.add(light);

  let self = this

  let mergedGeometry = new Three.Geometry;

  let countMerged = 0;

  let csv = (appState.dataset == 'work') ? '/work.csv' : '/education.csv'
  let toEastingField = (appState.dataset == 'work') ? 'SA2_workplace_easting' : 'SA2_educational_easting';
  let toNorthingField = (appState.dataset == 'work') ? 'SA2_workplace_northing' : 'SA2_educational_northing';

  papa.parse(csv, {
    download: true,
    header: true,
    step: function (row, parser) {
      if (row.data.Total < 50) {
        return;
      }
      let from = {
        x: eastingToMap(row.data.SA2_usual_residence_easting),
        y: northingToMap(row.data.SA2_usual_residence_northing)
      }
      let to = {
        x: eastingToMap(row.data[toEastingField]),
        y: northingToMap(row.data[toNorthingField])
        // x: row.data.SA2_educational_easting / 10000,
        // y: row.data.SA2_educational_northing / 10000
      }
      let midpoint = {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2
      }
      // console.log("from, to, midpoint:", from, to, midpoint)
      let op = from.y - to.y;
      let ad = from.x - to.x;
      let theta = Math.atan(op / ad);
      let hy = Math.sqrt(Math.pow(op, 2) + Math.pow(ad, 2)) * 1
      let scale = hy

      // Get rid of anything "boring" - not much distance and not much volume
      // if (hy < 50 ||row.data.Total < 180 ) {
      //   return
      // }

      // console.log("plotting row data", row.data)
      // let geometry = new Three.TorusBufferGeometry(hy/2, row.data.Total / 5000, 8, 10, Math.PI);
      let geometry = new Three.TorusGeometry(hy / 2, row.data.Total / 5000, 8, 10, Math.PI);
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
      if (countMerged++ > 300) {
        scene.add(new Three.Mesh(mergedGeometry, material));
        mergedGeometry = new Three.Geometry;
        countMerged = 0;

        if (!parser.paused()) {
          parser.pause()
        }
        setTimeout(function () {
          // results = null
          if (parser.paused())
            parser.resume()
        }, 100)
      }

      // self.scene.add(mesh);
      // self.scene.add(new Three.Mesh(mergedGeometry, material));
    },
    complete: function () {

      scene.add(new Three.Mesh(mergedGeometry, material));
      // this.renderer.render(this.scene, this.camera);
    }
  });
}

