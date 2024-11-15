import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const SpinningCube = () => {
  const cubeRef = useRef();

  useFrame(() => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += 0.01;
      cubeRef.current.rotation.x += 0.01;
    }
  });

  return (
    <mesh ref={cubeRef}>
      <boxGeometry args={[4, 4, 4]} />
      <meshBasicMaterial color="#4b0082" wireframe />
    </mesh>
  );
};

const DecentSmartHomeDefiCenter = () => (
  <Canvas style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh' }}>
    <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade />
    <SpinningCube />
    <ambientLight intensity={0.5} />
  </Canvas>
);

export default DecentSmartHomeDefiCenter;