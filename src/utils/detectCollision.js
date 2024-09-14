// src/utils/detectCollision.js
export function detectCollision(object1, object2) {
    // Simple collision detection logic based on distance
    const distance = Math.sqrt(
      (object1.position[0] - object2.position[0]) ** 2 +
      (object1.position[1] - object2.position[1]) ** 2 +
      (object1.position[2] - object2.position[2]) ** 2
    );
    return distance < object1.size + object2.size; // Assuming each object has a size property
  }