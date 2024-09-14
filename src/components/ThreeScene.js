import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, useTexture } from '@react-three/drei'; // Import useTexture
import * as THREE from 'three';
import { Spaceship as SpaceshipClass } from '../game/AsteRoids/spaceship';
import { Asteroid } from '../game/AsteRoids/asteroid';
import { checkCollision } from '../game/AsteRoids/collision';
import useInput from '../hooks/useInput';

// Component for rendering and controlling the spaceship
const Spaceship = ({ canvasSize, setAsteroids }) => {
    const [spaceship, setSpaceship] = useState(null);

    // Initialize the spaceship on component mount
    useEffect(() => {
        const newSpaceship = new SpaceshipClass(-canvasSize.width / 2 + 50, 0, canvasSize);
        setSpaceship(newSpaceship);
    }, [canvasSize]);

    // Handle input for spaceship
    useInput(spaceship);

    // Update spaceship position
    useFrame(() => {
        if (spaceship) {
            spaceship.update();
        }
    });

    return (
        spaceship && (
            <mesh position={[spaceship.x, spaceship.y, 0]}>
                <coneGeometry args={[5, 20, 32]} />
                <meshStandardMaterial color="red" />
            </mesh>
        )
    );
};

const Asteroids = ({ asteroids }) => {
    // Update asteroids' positions
    useFrame(() => {
        asteroids.forEach(asteroid => {
            asteroid.x -= asteroid.speed; // Move the asteroid left
            asteroid.update();
        });
    });

    return (
        <>
            {asteroids.map((asteroid, index) => (
                <mesh key={index} position={[asteroid.x, asteroid.y, 0]}>
                    <sphereGeometry args={[asteroid.size, 32, 32]} />
                    <meshStandardMaterial color="gray" />
                </mesh>
            ))}
        </>
    );
};

const Earth = () => {
    const earthTexture = useTexture('/assets/earth_texture.jpg'); // Load the texture
    const earthRef = useRef(); // Ref to hold the Earth mesh

    // Rotate the Earth on each frame
    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.01; // Adjust the speed of rotation as needed
        }
    });

    return (
        <Sphere ref={earthRef} args={[100, 64, 64]} position={[0, 0, 0]}>
            <meshStandardMaterial map={earthTexture} /> {/* Apply the texture */}
        </Sphere>
    );
};

const ThreeScene = () => {
    const [asteroids, setAsteroids] = useState([]);
    const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Initialize asteroids
    useEffect(() => {
        const initialAsteroids = [
            new Asteroid(canvasSize.width / 2, 100, 50, canvasSize),
            new Asteroid(canvasSize.width / 2, -100, 30, canvasSize),
            new Asteroid(canvasSize.width / 2, -200, 40, canvasSize),
        ];
        setAsteroids(initialAsteroids);
    }, [canvasSize]);

    // Adjust canvas size on window resize
    useEffect(() => {
        const handleResize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Canvas
            style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh' 
            }}
            camera={{ position: [0, 0, 1000] }} // Start zoomed out
            onCreated={({ gl }) => {
                // Set background color to black
                gl.setClearColor(new THREE.Color('black'), 1);
            }}
        >
            {/* Set up the camera */}
            {/* Remove `perspectiveCamera` here. Camera setup is now done via the `camera` prop in Canvas */}

            {/* Add OrbitControls for mouse interaction */}
            <OrbitControls enableZoom={true} />

            {/* Add stars to the background */}
            <Stars radius={300} depth={60} count={20000} factor={7} fade />

            {/* Add a rotating Earth */}
            <Earth /> {/* Using the new Earth component with texture */}

            {/* Render the spaceship */}
            <Spaceship canvasSize={canvasSize} setAsteroids={setAsteroids} />

            {/* Render asteroids */}
            <Asteroids asteroids={asteroids} />

            {/* Add ambient light */}
            <ambientLight intensity={0.5} />
            {/* Add directional light */}
            <directionalLight position={[0, 10, 5]} intensity={1} />
        </Canvas>
    );
};

export default ThreeScene;