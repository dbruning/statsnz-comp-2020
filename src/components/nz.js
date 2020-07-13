import * as Three from 'three'
import * as d3 from "d3";
import {Vector3} from "three";

let THREE = Three;

export const scaleFactor = 10000;

export let extent = {
  minNorthing: 470,
  maxNorthing : 620,
  minEasting : 115,
  maxEasting : 250,
  midNorthing : 0,
  midEasting: 0
}
extent.midNorthing = (extent.maxNorthing + extent.minNorthing) / 2;
extent.midEasting = (extent.maxEasting + extent.minEasting) / 2;

export function northingToMap(northing) {
  return (northing / scaleFactor) - extent.midNorthing;
}

export function eastingToMap(easting) {
  return (easting / scaleFactor) - extent.midEasting;
}


export function nzgdToVector2(twoPointArray) {
  return new THREE.Vector2(
    eastingToMap(twoPointArray[0]), northingToMap(twoPointArray[1])
  );
}

export function nzgdToVector3(twoPointArray) {
  return new THREE.Vector3(
    eastingToMap(twoPointArray[0]), northingToMap(twoPointArray[1]), 0
  );
}


