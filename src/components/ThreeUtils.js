import * as Three from 'three'
import * as d3 from "d3";

let THREE = Three;

// https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
// Converts a point [longitude, latitude] in degrees to a THREE.Vector3.
export function vertex(point) {
  // var lambda = point[0] * Math.PI / 180,
  //   phi = point[1] * Math.PI / 180,
  //   cosPhi = Math.cos(phi);
  return new THREE.Vector3(
    point[0] / 10000, point[1] / 10000, 0
  );
}

// https://gist.github.com/mbostock/2b85250396c17a79155302f91ec21224
// Converts a GeoJSON MultiLineString in spherical coordinates to a THREE.LineSegments.
export function wireframe(multilinestring, material) {
  let geometry = new THREE.Geometry;
  multilinestring.coordinates.forEach(function (line) {
    // debugger
    d3.pairs(line.map(vertex), function (a, b) {
      // d3.pairs(line, function(a, b) {
      geometry.vertices.push(a, b);
    });
  });
  return new THREE.LineSegments(geometry, material);
  // return new THREE.Mesh(geometry, material);
}

// Based on: https://stackoverflow.com/a/57744746/84898
export function featuresToGeometry(features) {
  debugger
  const shapes = [];

  for (const feature of features) {
    if (!feature.geometry || !feature.geometry.coordinates) continue;
    const coordinates = feature.geometry.coordinates;
    for (const coordinate of coordinates) {
      // contour
      const points = [];
      const contour = coordinate[0];
      for (const point of contour) {
        points.push(new THREE.Vector3(point[0] / 10000, point[1] / 10000));
      }

      const shape = new THREE.Shape(points);

      // hole
      const hole = coordinate[1];
      if (hole) {
        const path = new THREE.Path();
        for (let i = 0; i < hole.length; i++) {
          const point = hole[i];
          if (i === 0) {
            path.moveTo(point[0] / 10000, point[1] / 10000);
          } else {
            path.lineTo(point[0] / 10000, point[1] / 10000);
          }
        }
        shape.holes.push(path);
      }
      shapes.push(shape);
    }

  }

  const geometry = new THREE.ExtrudeBufferGeometry(shapes, {
    depth: 0.1,
    bevelEnabled: false
  });

  geometry.center();

  return geometry;
}
