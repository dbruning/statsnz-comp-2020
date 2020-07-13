import * as Three from "three";
import {eastingToMap, northingToMap, nzgdToVector2} from "./nz";
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

    let parts = [];
    let holes = [];
    if (feature.geometry.type == "Polygon") {
      parts.push(feature.geometry.coordinates[0]);

      if (feature.geometry.coordinates.length > 1) {
        holes = feature.geometry.coordinates.slice(1)
        // holes.push(feature.geometry.coordinates[1])
      }
    } else if (feature.geometry.type == "MultiPolygon") {
      // for(let multiPart of feature.geometry){
      //   parts.push(multiPart.coordinates[0]);
      //
      //   if (multiPart.coordinates.length > 1) {
      //     holes = multiPart.coordinates.slice(1)
      //     // holes.push(feature.geometry.coordinates[1])
      //   }
      //
      // }
      parts = feature.geometry.coordinates[0];
      // console.log("unknown: " + feature.geometry.type)
    }

    // let regionName = feature.properties.SA22018__1
    //   console.log("region: ", regionName)
    // if (regionName == "Karamea") {
    //   console.log("Karamea")
    // } else {
    //   continue
    // }

    // debugger

    // for (const part of feature.geometry.coordinates) {
    // For now, skip anything but first part
    // contour
    const points = [];
    // const contour = coordinate[0];
    for (let part of parts) {

      // if (!part || !part.coordinates || part.coordinates.length == 0) {
      // if (!part || !part.coordinates || part.coordinates.length == 0) {
      //   console.log("skipping")
      //   continue
      // }

      // console.log("part has sets of coordinates:", part.coordinates.length)
      // for (const coordinateSet of part.coordinates) {
        for (const point of part) {
          // console.log("point:", point[0], point[1])
          let vector = nzgdToVector2(point);
          // console.log("vector:", vector)
          points.push(vector);
        }

      // }

      const shape = new THREE.Shape(points);

      // console.log("shape", shape)

      for(let hole of holes) {
        // const hole = coordinate[1];
        // if (hole) {
          const path = new THREE.Path();
          for (let i = 0; i < hole.length; i++) {
            const point = hole[i];
            if (i === 0) {
              path.moveTo(eastingToMap(point[0]), northingToMap(point[1])) ;
            } else {
              path.lineTo(eastingToMap(point[0]), northingToMap(point[1])) ;
            }
          }
          shape.holes.push(path);
        }
      // }

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

      mesh.userData = feature.properties;
      result.push(mesh)
    }

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
