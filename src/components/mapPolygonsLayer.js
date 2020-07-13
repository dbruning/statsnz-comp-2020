import * as Three from "three";
import {nzgdToVector2} from "./nz";
import * as topojson from "topojson-client";

let THREE = Three

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



// Based on: https://stackoverflow.com/a/57744746/84898
export function makePolygons(topoJsonData) {
  const shapes = [];
  let result = []
  // Use topojson-client to parse the topojson into an array of multiline strings
  // https://github.com/topojson/topojson-client
  let featuresObject = topojson.feature(topoJsonData, topoJsonData.objects["statistical-area-2-2018-generalised"])

  if (!featuresObject || !featuresObject.features) return
  for (const feature of featuresObject.features) {
    if (!feature.geometry || !feature.geometry.coordinates) continue;

    let part;
    if (feature.geometry.type == "Polygon") {
      part = feature.geometry;
    } else if (feature.geometry.type != "MultiPolygon") {
      part = feature.geometry[0];
      // console.log("unknown: " + feature.geometry.type)
    }

    // for (const part of feature.geometry.coordinates) {
    // For now, skip anything but first part
    // contour
    const points = [];
    // const contour = coordinate[0];
    if (!part || !part.coordinates || part.coordinates.length == 0) continue
    for (const point of part.coordinates[0]) {
      // console.log("point:", point[0], point[1])
      let vector= nzgdToVector2(point);
      // console.log("vector:", vector)
      points.push(vector);
    }

    const shape = new THREE.Shape(points);

    // console.log("shape", shape)

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
    // shapes.push(shape);
    let geometry = new THREE.ShapeBufferGeometry(shape)
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    let material = new Three.MeshBasicMaterial({color: 0xffff00});
    let mesh = new THREE.Mesh(geometry, material)

    result.push(mesh)

  }

  return result;

  // // TODO: return the shapes, merge them for display (maybe edges?) but keep separate for click detection
  // const geometry = new THREE.ShapeBufferGeometry(shapes)
  //
  // geometry.computeBoundingSphere();
  // geometry.computeBoundingBox();

  // let center = new Vector3(0,0,0);
  // center = geometry.boundingBox.getCenter(center);
  // console.log("Center of map: ", center)
  // geometry.center();
  //
  // console.log("geometry:", geometry)
  // geometry.computeBoundingSphere();

  // return geometry;
  // return edgesGeometry;
}
