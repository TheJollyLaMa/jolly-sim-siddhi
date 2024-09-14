// src/components/AsteroidGame.js
import React, { useEffect, useRef } from 'react';
import Spaceship from '../game/spaceship';
import Asteroid from '../game/asteroid';
import checkCollision from '../game/collision';

const AsteroidGame = () => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let gameOver = false;
        let gameWon = false;
        let gameOverTimer = 0;
        const GAME_OVER_DELAY = 2000;

        const spaceship = new Spaceship(canvas.width / 2, canvas.height / 2, canvas);

        let asteroids = [];
        for (let i = 0; i < 5; i++) {
            asteroids.push(new Asteroid(null, null, null, canvas));
        }

        // Game loop
        function gameLoop(timestamp) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (gameWon) {
                displayGameWin();
                return;
            }

            spaceship.update();
            spaceship.draw();

            if (!gameOver) {
                asteroids.forEach((asteroid, asteroidIndex) => {
                    asteroid.update();
                    asteroid.draw();

                    spaceship.bullets.forEach((bullet, bulletIndex) => {
                        if (checkCollision(bullet, asteroid)) {
                            spaceship.bullets.splice(bulletIndex, 1);
                            const fragments = asteroid.breakApart();
                            asteroids.splice(asteroidIndex, 1);
                            asteroids = asteroids.concat(fragments);
                        }
                    });

                    if (checkCollision(spaceship, asteroid)) {
                        spaceship.breakApart();
                        gameOver = true;
                        gameOverTimer = timestamp;
                    }
                });
            } else {
                const timeElapsed = timestamp - gameOverTimer;
                if (timeElapsed > GAME_OVER_DELAY) {
                    displayGameOver();
                }
            }

            requestAnimationFrame(gameLoop);
        }

        function displayGameOver() {
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        }

        function displayGameWin() {
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText('You Win!', canvas.width / 2 - 80, canvas.height / 2);
        }

        requestAnimationFrame(gameLoop);

    }, []);

    return <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black' }} />;
};

export default AsteroidGame;