// src/hooks/useAsteroids.js
import { useState, useEffect } from 'react';

export function useAsteroids(numAsteroids = 10) {
  const [asteroids, setAsteroids] = useState([]);

  useEffect(() => {
    // Spawn initial asteroids
    const initialAsteroids = Array.from({ length: numAsteroids }, () => ({
      position: [Math.random() * 20 - 10, Math.random() * 10 - 5, Math.random() * 10 - 5],
      velocity: [Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05],
    }));
    setAsteroids(initialAsteroids);
  }, [numAsteroids]);

  const updateAsteroids = () => {
    setAsteroids((prevAsteroids) =>
      prevAsteroids.map((asteroid) => ({
        ...asteroid,
        position: [
          asteroid.position[0] + asteroid.velocity[0],
          asteroid.position[1] + asteroid.velocity[1],
          asteroid.position[2] + asteroid.velocity[2],
        ],
      }))
    );
  };

  return { asteroids, updateAsteroids };
}