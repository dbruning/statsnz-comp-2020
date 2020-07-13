import * as Three from 'three'
import * as d3 from "d3";
import {northingToMap, eastingToMap} from "./nz.js";

let THREE = Three;

function nzgdToVector2(twoPointArray) {
  return new THREE.Vector2(
    northingToMap(twoPointArray[0]), eastingToMap(twoPointArray[1])
  );
}

function nzgdToVector3(twoPointArray) {
  return new THREE.Vector3(
    northingToMap(twoPointArray[0]), eastingToMap(twoPointArray[1]), 0
  );
}


// function translate(twoPointArray) {
//   return parseInt(Math.round(c / 1000 ));
//   // return Math.round(c );
// }

// https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
// export function toVector3(point) {
//   // var lambda = point[0] * Math.PI / 180,
//   //   phi = point[1] * Math.PI / 180,
//   //   cosPhi = Math.cos(phi);
//   return new THREE.Vector3(
//     translate(point[0]), translate(point[1]),0) ;
// }

// https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
export function wireframe(multilinestring, material) {
  let geometry = new THREE.Geometry;
  multilinestring.coordinates.forEach(function (line) {
    d3.pairs(line.map(nzgdToVector3()), function (a, b) {
      // d3.pairs(line, function(a, b) {
      geometry.vertices.push(a, b);
    });
  });
  return new THREE.LineSegments(geometry, material);
  // return new THREE.Mesh(geometry, material);
}

// Based on: https://stackoverflow.com/a/57744746/84898
export function featuresToGeometry(features) {
  console.log("featuresToGeometry")
  const shapes = [];

  var i = 0;
  if (!features) return
  for (const feature of features) {
    if (!feature.geometry || !feature.geometry.coordinates) continue;

    // debugger;
    let part;
    if (feature.geometry.type == "Polygon") {
      part = feature.geometry;
    } else if (feature.geometry.type != "MultiPolygon") {
      part = feature.geometry[0];
      // console.log("unknown: " + feature.geometry.type)
    }

    // if (i++ > 10) break;

    // for (const part of feature.geometry.coordinates) {
      // For now, skip anything but first part
      // contour
      const points = [];
      // const contour = coordinate[0];
    if (!part || !part.coordinates || part.coordinates.length == 0) continue
      for (const point of part.coordinates[0]) {
        points.push(new nzgdToVector2(point));
      }

      const shape = new THREE.Shape(points);

      console.log("shape", shape)

      // hole
      // const hole = coordinate[1];
      // if (hole) {
      //   const path = new THREE.Path();
      //   for (let i = 0; i < hole.length; i++) {
      //     const point = hole[i];
      //     if (i === 0) {
      //       path.moveTo(point[0] / 10000, point[1] / 10000);
      //     } else {
      //       path.lineTo(point[0] / 10000, point[1] / 10000);
      //     }
      //   }
      //   shape.holes.push(path);
      // }
      shapes.push(shape);
    // }

  }

  const geometry = new THREE.ShapeBufferGeometry(shapes)
  // const geometry = new THREE.ExtrudeBufferGeometry(shapes, {
  //   depth: 1,
  //   bevelEnabled: false
  // }

  geometry.computeBoundingBox();

  console.log("Center before move: ")
  geometry.center();

  console.log("geometry:", geometry)
  // geometry.computeBoundingSphere();

  return geometry;
}
