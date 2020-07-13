import * as Three from 'three'
let THREE = Three;

// https://stackoverflow.com/a/59741870/84898
const clickDelta = 6;
let startClickX;
let startClickY;

export function detectClicks(container, camera, meshes, root) {
  container.addEventListener('mousedown', function (event) {
    startClickX = event.pageX;
    startClickY = event.pageY;
  });

  container.addEventListener('mouseup', function (event) {
    const diffX = Math.abs(event.pageX - startClickX);
    const diffY = Math.abs(event.pageY - startClickY);

    if (diffX < clickDelta && diffY < clickDelta) {

      // console.log("click event", event)
      let rect = container.getBoundingClientRect();
      let mouse3D = new THREE.Vector3(
        ((event.clientX - rect.left) / (rect.right - rect.left)) * 2 - 1,
        -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1,
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

  })
}
