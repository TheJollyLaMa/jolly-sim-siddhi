// src/hooks/useSpaceship.js
import { useState } from 'react';

export function useSpaceship() {
  const [position, setPosition] = useState([5, 0, 0]);
  const [rotation, setRotation] = useState(0); // Rotation in radians

  const moveSpaceship = (direction) => {
    // Update spaceship position based on direction (right, left, up, down)
    setPosition((prevPosition) => {
      const newPosition = [...prevPosition];
      if (direction === 'up') newPosition[1] += 0.1;
      if (direction === 'down') newPosition[1] -= 0.1;
      if (direction === 'left') newPosition[0] -= 0.1;
      if (direction === 'right') newPosition[0] += 0.1;
      return newPosition;
    });
  };

  const rotateSpaceship = (angle) => {
    // Rotate spaceship
    setRotation((prevRotation) => prevRotation + angle);
  };

  return { position, rotation, moveSpaceship, rotateSpaceship };
}