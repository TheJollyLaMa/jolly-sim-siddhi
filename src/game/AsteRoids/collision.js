// collision.js
export const checkCollision = (obj1, obj2) => {
    const dist = Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
    return dist < obj1.size + obj2.size;
  };