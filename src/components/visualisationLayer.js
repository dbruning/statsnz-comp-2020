import * as Three from "three";
import * as papa from "papaparse";
import {eastingToMap, northingToMap} from "./nz";

let THREE = Three

let downloadedWorkRows = []
let downloadedStudyRows = []

function getDownloadedRows(appState) {
  return (appState.dataset == 'work') ? downloadedWorkRows : downloadedStudyRows
}

let hopMaterial = new Three.MeshPhongMaterial({color: 0xffff00});

function getSettingsForDataset(dataset) {
  return {
    csv: (dataset == 'work') ? '/work.csv' : '/education.csv',
    toEastingField: (dataset == 'work') ? 'SA2_workplace_easting' : 'SA2_educational_easting',
    toNorthingField: (dataset == 'work') ? 'SA2_workplace_northing' : 'SA2_educational_northing',
    toNameField: (dataset == 'work') ? 'SA2_name_workplace_address' : 'SA2_name_educational_address'
  }
}

function getFullTransportModeField(fieldName, appState) {
  if (fieldName == "at_home") {
    if (appState.dataset == 'work') {
      return "Work_at_home"
    } else {
      return "Study_at_home"
    }
  }
  return fieldName

}

export function addVisualisationData(scene, appState, progressCallback) {
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

  // Adjust what to ignore below, depending on the mode of transport
  if (appState.transportMode == "at_home") {
    ignoreBelowTotal *= 0.5
  } else if (appState.transportMode == "Drive_a_private_car_truck_or_van") {
    ignoreBelowTotal *= 0.8
  } else if (appState.transportMode == "Drive_a_company_car_truck_or_van") {
    ignoreBelowTotal *= 0.6
  } else if (appState.transportMode == "Passenger_in_a_car_truck_van_or_company_bus") {
    ignoreBelowTotal *= 0.6
  } else if (appState.transportMode == "Public_bus") {
    ignoreBelowTotal *= 0.6
  } else if (appState.transportMode == "Train") {
    ignoreBelowTotal = 0
  } else if (appState.transportMode == "Bicycle") {
    ignoreBelowTotal = 0
  } else if (appState.transportMode == "Walk_or_jog") {
    ignoreBelowTotal = 0
  } else if (appState.transportMode == "Ferry") {
    ignoreBelowTotal = 0
  } else if (appState.transportMode == "Other") {
    ignoreBelowTotal = 0
  }


  appState.progressTask = "Loading data..."
  appState.hasLoadedVisualisation = false
  appState.isLoadingVisualisation = true
  // appState.progressPercent = 0

  let rowsProcessed = 0;
  let highestRowTotal = 0;
  let transportMode = getFullTransportModeField(appState.transportMode, appState)

  let downloadedRows = getDownloadedRows(appState)

  // Function to define what we'll do with each row, regardless of whether we're streaming & parsing, or looping over already-downloaded rows
  function processRow(row, batchCallback) {
    let count = row.data[transportMode]
    if (count == -999 || count == 0 || count == undefined) return;

    // Set the highest row total, for progress, first time through
    if (highestRowTotal == 0) {
      highestRowTotal = count
    }

    // Calculate progress
    if (rowsProcessed++ % 100 == 0) {
      let rawFractionComplete = (highestRowTotal - count) / (highestRowTotal - ignoreBelowTotal)
      // console.log("rowsProcessed:", {rowsProcessed, highestRowTotal, count, ignoreBelowTotal})
      // console.log("rawFractionComplete:", rawFractionComplete)
      appState.progressPercent = Math.pow(rawFractionComplete, 3) * 100
    }

    // Ignore data below user-selected limit
    if (count < ignoreBelowTotal) {
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

      // console.log("ProcessRow, maybe going to call batchCallback", batchCallback)
      if (batchCallback && typeof (batchCallback) === 'function') {
        batchCallback()
      }
    }
  }

  function allRowsCompleted() {
    // Add the final mesh to the scene & results
    let mesh = new Three.Mesh(mergedGeometry, hopMaterial);
    scene.add(mesh);
    result.push(mesh)

    appState.progressTask = ""

    appState.hasLoadedVisualisation = true
    appState.isLoadingVisualisation = false
  }


  // If we've already got downloaded rows, just run through them in a simple loop
  if (downloadedRows.length) {
    let rowIndex = -1;
    let isPaused = false
    let resume = function() {
      while (!isPaused) {
        rowIndex++;

        // If we've processed all rows, run the completion function and exit
        if (rowIndex >= downloadedRows.length) {
          allRowsCompleted()
          return
        }

        // If we haven't yet processed all rows, process the next one
        if (rowIndex > downloadedRows.length || isPaused) return;
        processRow(downloadedRows[rowIndex], function() {
          // If this is the end of a batch, pause for a bit to let the paint happen
          isPaused = true;
          setTimeout(function () {
            // After 100ms pause, unpause and continue
            isPaused = false;
            resume()
          }, 100)
        })

      }
    }
    resume()

  } else {
    papa.parse(csv, {
      download: true,
      header: true,
      step: function (row, parser) {
        downloadedRows.push(row);
        processRow(row, function () {
          // After every batch, have a wee lie down, so the renderer can have a chance to render.
          if (!parser.paused()) {
            parser.pause()
          }
          setTimeout(function () {
            // results = null
            if (parser.paused())
              parser.resume()
          }, 100)
          if (progressCallback && typeof(progressCallback) == 'function') {
            progressCallback()
          }
        })
      },
      complete: function () {
        allRowsCompleted()
      }
    })
  }

  return result;
}

export function getRegionData(regionName, appState, areaPolygons) {
  let result = {
    movementData: [],
    areaPolygon: null,
    hops: []
  }

  let {toEastingField, toNorthingField, toNameField} = getSettingsForDataset(appState.dataset)

  // Try to find a region polygon with that name
  result.areaPolygon = areaPolygons.find(p => p.userData.SA22018__1 == regionName)

  let transportMode = getFullTransportModeField(appState.transportMode, appState)

  let downloadedRows = getDownloadedRows(appState)
  for (let row of downloadedRows) {

    let count = row.data[transportMode]
    if (count == -999 || count == 0) continue;

    // Build up results showing movement to & from the highlighted region
    if (row.data.SA2_name_usual_residence_address == regionName) {
      if (row.data[toNameField] == regionName) {
        result.movementData.push({direction: 'within', name: row.data[toNameField], count: count})
      } else {
        result.movementData.push({direction: 'to', name: row.data[toNameField], count: count})
      }
      result.hops.push(getHopMesh(row, toEastingField, toNorthingField, hopMaterial))
    } else if (row.data[toNameField] == regionName) {
      result.movementData.push({direction: 'from', name: row.data.SA2_name_usual_residence_address, count: count})
      result.hops.push(getHopMesh(row, toEastingField, toNorthingField, hopMaterial))
    }

  }

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


