import * as Three from "three";
import * as papa from "papaparse";
import {eastingToMap, northingToMap} from "./nz";

let THREE = Three


export function getRegionData(regionName) {

}

export function addVisualisationData(scene, appState) {
  let result = []

  let material = new Three.MeshPhongMaterial({color: 0xffff00});

  let mergedGeometry = new Three.Geometry;

  let countMerged = 0;

  let csv = (appState.dataset == 'work') ? '/work.csv' : '/education.csv'
  let toEastingField = (appState.dataset == 'work') ? 'SA2_workplace_easting' : 'SA2_educational_easting';
  let toNorthingField = (appState.dataset == 'work') ? 'SA2_workplace_northing' : 'SA2_educational_northing';

  let ignoreBelowTotal = 50;
  if (appState.dataDetail == "low") {
    ignoreBelowTotal = 200;
  } else if (appState.dataDetail == "med") {
    ignoreBelowTotal = 50;
  } else if (appState.dataDetail == "high") {
    ignoreBelowTotal = 10;
  }

  let rowsProcessed = 0;

  appState.progressTask = "Loading data..."
  // appState.progressPercent = 0

  let highestRowTotal = 0;

  papa.parse(csv, {
    download: true,
    header: true,
    step: function (row, parser) {
      // Set the highest row total, for progress, first time through
      if (highestRowTotal == 0) {
        highestRowTotal = row.data.Total
      }

      // Calculate progress
      if (rowsProcessed++ % 100 == 0) {
        let rawFractionComplete = (highestRowTotal - row.data.Total) / (highestRowTotal - ignoreBelowTotal)
        appState.progressPercent = Math.pow(rawFractionComplete, 3) * 100
      }

      // Ignore data below user-selected limit
      if (row.data.Total < ignoreBelowTotal) {
        return;
      }

      function getHopGeometry(row, toEastingField, toNorthingField) {

        let from = {
          x: eastingToMap(row.data.SA2_usual_residence_easting),
          y: northingToMap(row.data.SA2_usual_residence_northing)
        }
        let to = {
          x: eastingToMap(row.data[toEastingField]),
          y: northingToMap(row.data[toNorthingField])
        }
        let midpoint = {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2
        }

        let op = from.y - to.y;
        let ad = from.x - to.x;
        let theta = Math.atan(op / ad);
        let hy = Math.sqrt(Math.pow(op, 2) + Math.pow(ad, 2)) * 1

        let geometry = new Three.TorusGeometry(hy / 2, row.data.Total / 5000, 8, 10, Math.PI);
        geometry.rotateX(Math.PI / 2)

        let mesh = new Three.Mesh(geometry, material);

        mesh.rotateZ(theta)

        mesh.position.x = midpoint.x
        mesh.position.y = midpoint.y
        mesh.position.z = 0;

        return mesh;
      }
      let hopMesh = getHopGeometry(row, toEastingField, toNorthingField)

      mergedGeometry.mergeMesh(hopMesh);
      if (countMerged++ > 300) {
        let mesh = new Three.Mesh(mergedGeometry, material);
        scene.add(mesh);
        result.push(mesh)

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

      let mesh = new Three.Mesh(mergedGeometry, material);
      scene.add(mesh);
      result.push(mesh)

      appState.progressTask = ""
    }
  });

  return result;
}

