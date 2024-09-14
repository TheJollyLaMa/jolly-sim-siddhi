export class Spaceship {
    constructor(x, y, canvasSize) {
        this.x = -canvasSize.width / 2 + 50; // Start on the left side of the screen
        this.y = 0; // Center vertically
        this.canvasSize = canvasSize;
        this.speed = 5; // Adjust speed as necessary
        this.bullets = [];
    }

    moveUp() {
        this.y += this.speed;
    }

    moveDown() {
        this.y -= this.speed;
    }

    moveLeft() {
        this.x -= this.speed; // Move left
    }

    moveRight() {
        this.x += this.speed; // Move right
    }

    shoot() {
        this.bullets.push({
            x: this.x,
            y: this.y,
            speed: 10 // Adjust bullet speed as needed
        });
    }

    update() {
        // Update bullets
        this.bullets.forEach(bullet => {
            bullet.x += bullet.speed; // Bullets move towards the right
        });

        // Remove bullets that are out of bounds
        this.bullets = this.bullets.filter(bullet => bullet.x < this.canvasSize.width / 2);
    }
}