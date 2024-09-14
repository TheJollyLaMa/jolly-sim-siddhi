// asteroid.js
export class Asteroid {
    constructor(x, y, size, canvas) {
      this.x = x || Math.random() * canvas.width;
      this.y = y || Math.random() * canvas.height;
      this.size = size || 30;
      this.velocity = { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 };
      this.canvas = canvas;
      this.isDestroyed = false;
    }
  
    update() {
      // Update asteroid position
      this.x += this.velocity.x;
      this.y += this.velocity.y;
  
      // Handle edge of screen
      if (this.x > this.canvas.width) this.x = 0;
      if (this.x < 0) this.x = this.canvas.width;
      if (this.y > this.canvas.height) this.y = 0;
      if (this.y < 0) this.y = this.canvas.height;
    }
  
    breakApart() {
      this.isDestroyed = true;
      // Logic for breaking into smaller fragments
      return [
        new Asteroid(this.x, this.y, this.size / 2, this.canvas),
        new Asteroid(this.x, this.y, this.size / 2, this.canvas),
      ];
    }
  }