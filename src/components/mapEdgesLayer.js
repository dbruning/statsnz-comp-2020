import * as Three from 'three'
import * as topojson from "topojson-client";
import * as d3 from "d3";
import {northingToMap, eastingToMap} from "./nz.js";
import {nzgdToVector3} from "./nz";

let THREE = Three


// https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
function makeWireframe(multilinestring, material) {
  let geometry = new THREE.Geometry;
  multilinestring.coordinates.forEach(function (line) {
    d3.pairs(line.map(nzgdToVector3), function (a, b) {
      // d3.pairs(line, function(a, b) {
      geometry.vertices.push(a, b);
    });
  });
  return new THREE.LineSegments(geometry, material);
  // return new THREE.Mesh(geometry, material);
}

export function addMapEdgesToScene(topoJsonData, scene) {
  // Use topojson-client to parse the topojson into an array of multiline strings
  // https://github.com/topojson/topojson-client
  let nzMesh = topojson.mesh(topoJsonData, topoJsonData.objects["statistical-area-2-2018-generalised"])

  // Turn those multiline strings into LineSegments that three.js knows how to draw
  let nzWireframe = makeWireframe(nzMesh, new Three.LineBasicMaterial({color: '#4d966b'}));
  scene.add(nzWireframe)
}

