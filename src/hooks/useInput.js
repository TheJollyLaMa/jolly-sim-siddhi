import { useEffect } from 'react';

const useInput = (spaceship) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!spaceship) return; // Prevent errors if spaceship is not yet set
            switch (event.key) {
                case 'ArrowLeft':
                    spaceship.moveLeft();
                    break;
                case 'ArrowRight':
                    spaceship.moveRight();
                    break;
                case 'ArrowUp':
                    spaceship.moveUp();
                    break;
                case 'ArrowDown':
                    spaceship.moveDown();
                    break;
                case ' ':
                    spaceship.shoot();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [spaceship]);
};

export default useInput;