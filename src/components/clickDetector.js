import * as Three from 'three'

let THREE = Three;

// https://stackoverflow.com/a/59741870/84898
const clickDelta = 6;
let startClickX;
let startClickY;

export function detectClicks(container, camera, meshes, root) {

  // Start detecting on mousedown
  container.addEventListener('mousedown', function(event) {
    startClickX = event.pageX;
    startClickY = event.pageY;
  }, false);

  // Start detecting on single touchstart
  container.addEventListener('touchstart', function(event) {
    if (event.touches && event.touches.length == 1) {
      startClickX = event.touches[0].pageX;
      startClickY = event.touches[0].pageY;
    }
    else {
      startClickX = null;
      startClickY = null;
    }
  }, false);

  let mouseUp = function (event) {
    // If we've got more than one changed touch, bail (click is single-touch)
    if (event.changedTouches && event.changedTouches.length > 1) return;
    // If we've still got some remaining active touches, bail (click is single-touch)
    if (event.targetTouches && event.targetTouches.length > 0) return;

    let coordsObj = {}
    if (event.changedTouches && event.changedTouches.length == 1) {
      coordsObj = event.changedTouches[0];
    } else {
      coordsObj = event
    }

    let diffX = Math.abs(coordsObj.pageX - startClickX);
    let diffY = Math.abs(coordsObj.pageY - startClickY);

    if (diffX < clickDelta && diffY < clickDelta) {

      // console.log("click event", event)
      let rect = container.getBoundingClientRect();
      let mouse3D = new THREE.Vector3(
        ((coordsObj.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1,
        -((coordsObj.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
        0.1);

      let raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse3D, camera);

      let intersects = raycaster.intersectObjects(meshes);
      if (intersects.length) {
        let mesh = intersects[0]
        root.$emit("regionClicked", mesh.object.userData)
        // console.log("clicked on:", mesh.object.userData.SA22018__1)
      }

    }
  }
  container.addEventListener('mouseup', mouseUp, false);
  container.addEventListener('touchend', mouseUp, false);

}
