import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MediapipeARThree } from "mediapipear-face-three";

const mediapipearThree = new MediapipeARThree({
  container: document.querySelector("#container"),
  filterMinCF: 0.01,
  filterBeta: 0.001,
});

const { renderer, scene, camera } = mediapipearThree;
const eyeGlassAnchor = mediapipearThree.addAnchor(168);
const leftEarAnchor = mediapipearThree.addAnchor(234);
const rightEarAnchor = mediapipearThree.addAnchor(454);
const occluderMesh = mediapipearThree.addFaceMesh();
const faceOccluderMat = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.99,
  colorWrite: false,
});
occluderMesh.material = faceOccluderMat;
occluderMesh.renderOrder = 0;
scene.add(occluderMesh);

const earOccluderBoxGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.3);
const earOccluderBoxMat = new THREE.MeshBasicMaterial({
  color: 0x00ffff,
  transparent: true,
  opacity: 0.5,
  colorWrite: false,
});
const leftEarOccluder = new THREE.Mesh(earOccluderBoxGeometry, earOccluderBoxMat);
leftEarOccluder.position.set(0, 0.2, -0.3);
leftEarAnchor.group.add(leftEarOccluder);
const rightEarOccluder = new THREE.Mesh(earOccluderBoxGeometry, earOccluderBoxMat);
rightEarOccluder.position.set(0, 0.2, -0.3);
rightEarAnchor.group.add(rightEarOccluder);

const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2);
scene.add(light);

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMap = cubeTextureLoader.load([
  "./environment/px.jpg",
  "./environment/nx.jpg",
  "./environment/py.jpg",
  "./environment/ny.jpg",
  "./environment/pz.jpg",
  "./environment/nz.jpg",
]);

scene.environment = environmentMap;


function loadEyeglass(eyeglass) {
  const loadingText = document.querySelector("#loadingText");
  loadingText.style.display = "block";

  const loader = new GLTFLoader();
  loader.load(
    `./glb/${eyeglass.glb}.glb`,
    function (gltf) {
      loadingText.style.display = "none";

      if (eyeGlassAnchor.group.children.length > 0) {
        eyeGlassAnchor.group.remove(eyeGlassAnchor.group.children[0]);
      }

      const model = gltf.scene;
      eyeGlassAnchor.group.add(model);
      model.scale.set(eyeglass.scalex, eyeglass.scaley, eyeglass.scalez);
      model.position.set(eyeglass.posx, eyeglass.posy, eyeglass.posz);
      model.rotation.set(eyeglass.rotx, eyeglass.roty, eyeglass.rotz);
      model.traverse(function (node) {
        if (node.isMesh) {
          node.material.transparent = true;
          node.material.depthTest = true;
          node.material.depthWrite = true;
          node.material.envMap = environmentMap;
          node.renderOrder = 2;
        }
      });
    }
  );
}

fetch("EyeGlassesData.json")
  .then((response) => response.json())
  .then((data) => {
    const eyeglassesData = data.eyeglasses;

    const buttonsContainer = document.querySelector("#buttonsContainer");

    eyeglassesData.forEach((eyeglass, index) => {
      const button = document.createElement("button");
      button.textContent = `Eyeglass ${index + 1}`;

      button.addEventListener("click", () => {
        const buttons = buttonsContainer.querySelectorAll("button");
        buttons.forEach((btn) => btn.classList.remove("highlighted"));

        button.classList.add("highlighted");

        loadEyeglass(eyeglass);
      });

      buttonsContainer.appendChild(button);
    });

    const firstButton = buttonsContainer.querySelector("button");
    firstButton.classList.add("highlighted");

    loadEyeglass(eyeglassesData[0]);
  })
  .catch((error) => console.error("Error fetching JSON:", error));

const start = async () => {
  await mediapipearThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};
start();
