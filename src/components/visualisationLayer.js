import * as Three from "three";
import * as papa from "papaparse";
import {eastingToMap, northingToMap} from "./nz";

let THREE = Three

let downloadedRows = []
let hopMaterial = new Three.MeshPhongMaterial({color: 0xffff00});

function getSettingsForDataset(dataset) {
  return {
    csv: (dataset == 'work') ? '/work.csv' : '/education.csv',
    toEastingField: (dataset == 'work') ? 'SA2_workplace_easting' : 'SA2_educational_easting',
    toNorthingField: (dataset == 'work') ? 'SA2_workplace_northing' : 'SA2_educational_northing',
    toNameField: (dataset == 'work') ? 'SA2_name_workplace_address' : 'SA2_name_educational_address'
  }
}

export function addVisualisationData(scene, appState) {
  let result = []

  let mergedGeometry = new Three.Geometry;

  let countMerged = 0;

  let {csv, toEastingField, toNorthingField} = getSettingsForDataset(appState.dataset)

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

  downloadedRows.length = 0;
  papa.parse(csv, {
    download: true,
    header: true,
    step: function (row, parser) {
      downloadedRows.push(row);
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

      // Figure out the geometry of the hop for this row
      let hopMesh = getHopMesh(row, toEastingField, toNorthingField, hopMaterial)

      // Merge it into our merge geometry
      mergedGeometry.mergeMesh(hopMesh);

      // If we've now merged 300 geometries, add that to the scene
      if (countMerged++ > 300) {

        let mesh = new Three.Mesh(mergedGeometry, hopMaterial);
        scene.add(mesh);
        result.push(mesh)

        mergedGeometry = new Three.Geometry;
        countMerged = 0;

        // Have a wee lie down, so the renderer can have a chance to render.
        if (!parser.paused()) {
          parser.pause()
        }
        setTimeout(function () {
          // results = null
          if (parser.paused())
            parser.resume()
        }, 100)
      }
    },
    complete: function () {

      // Add the final mesh to the scene & results
      let mesh = new Three.Mesh(mergedGeometry, hopMaterial);
      scene.add(mesh);
      result.push(mesh)

      appState.progressTask = ""
    }
  });

  return result;
}

export function getRegionData(regionName, appState, areaPolygons) {
  console.log("Getting region data for region name:", regionName)

  let result = {
    movementData: [],
    areaPolygon: null,
    hops: []
  }

  let mergedGeometry = new Three.Geometry;
  let countMerged = 0;

  let {csv, toEastingField, toNorthingField, toNameField} = getSettingsForDataset(appState.dataset)

  // Try to find a region polygon with that name
  result.areaPolygon = areaPolygons.find(p => p.userData.SA22018__1 == regionName)

  for (let row of downloadedRows) {

    // Build up results showing movement to & from the highlighted region
    if (row.data.SA2_name_usual_residence_address == regionName) {
      result.movementData.push({direction: 'to', name: row.data[toNameField], count: row.data.Total})
      result.hops.push(getHopMesh(row, toEastingField, toNorthingField, hopMaterial))
    } else if (row.data[toNameField] == regionName) {
      result.movementData.push({direction: 'from', name: row.data.SA2_name_usual_residence_address, count: row.data.Total})
      result.hops.push(getHopMesh(row, toEastingField, toNorthingField, hopMaterial))
    }

  }

  console.log(result)
  // // Add the final mesh to the scene & results
  // let mesh = new Three.Mesh(mergedGeometry, material);
  // scene.add(mesh);
  // result.push(mesh)
  //
  // appState.progressTask = ""

  return result;

}

function getHopMesh(row, toEastingField, toNorthingField, material) {

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


