import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, earthMesh, controls;

    const init = () => {
      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 3);
      camera.lookAt(scene.position);

      // Renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Earth geometry
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const texture = new THREE.TextureLoader().load('assets/earth_texture.jpg');
      const material = new THREE.MeshBasicMaterial({ map: texture });
      earthMesh = new THREE.Mesh(geometry, material);
      scene.add(earthMesh);

      // Orbit controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI / 2;

      // Mouse wheel event for zoom
      document.addEventListener('wheel', onDocumentMouseWheel, false);

      // Start animation loop
      animate();
    };

    const animate = () => {
      requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };

    const onDocumentMouseWheel = (event) => {
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
      camera.updateProjectionMatrix();
    };

    init();

    // Cleanup on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      document.removeEventListener('wheel', onDocumentMouseWheel);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default ThreeScene;
