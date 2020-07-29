import * as PIXI from 'pixi.js';
import * as utils from './utils';

class Snake {
    constructor(rendererWidth, rendererHeight) {
        const head = new PIXI.Graphics();
        
        const initialSnakeXCoordinate = utils.default.getRandomInt(1, rendererWidth / 50) * 50;
        const initialSnakeYCoordinate = utils.default.getRandomInt(1, rendererHeight / 50) * 50
        
        head.x = initialSnakeXCoordinate;
        head.y = initialSnakeYCoordinate;
        head.beginFill(0xff0000);
        head.drawRect(0,0, 50, 50);
        head.endFill();

        this.getHead = () => head;

        const tails = [];

        this.tailsCount = () => tails.length;

        this.loopThroughTails = (callback) => {
            tails.forEach(function(tail, index) {
                callback(tail, index);
            });
        };

        this.loopThroughWithCondition = (callback) => {
            return tails.some((tail) => callback(tail));
        };

        this.addTail = (container) => {
            const tail = new PIXI.Graphics();
            
            if (tails.length) {
                const lastTail = tails[tails.length - 1];
                
                tail.x = lastTail.x;
                tail.y = lastTail.y;
                
            } else {
                const snakeHeadBounds = head.getBounds();
                
                tail.x = snakeHeadBounds.x;
                tail.y = snakeHeadBounds.y;
            }

            const currentlyPressedKey = this.currentlyPressedKey();

            switch (currentlyPressedKey) { // TODO [GM]: Extract movement speed
                case '65': tail.x += 50; break; // A
                case '68': tail.x -= 50; break; // D
                case '83': tail.y -= 50; break; // S
                case '87': tail.y += 50; break; // W
            }

            tails.push(tail);

            tail.beginFill(0x820808);
            tail.drawRect(0, 0, 50, 50);
            tail.endFill();

            container.addChild(tail);
        };

        const initialSnakeCoordinates = {x: initialSnakeXCoordinate, y: initialSnakeYCoordinate};
        const passedCoordinates = [initialSnakeCoordinates];

        this.passedCoordinatesCount = () => passedCoordinates.length;
        this.removeLastPastCoordinate = () => passedCoordinates.pop();
        this.getPassedCoordinateAtIndex = (index) => passedCoordinates[index];
        this.addPassedCoordinate = (coordinate) => { passedCoordinates.unshift(coordinate); };
    }

    beginMovement() {
        // default movement direction
        const directionKeys = {
            '65': true // A
        };

        this.currentlyPressedKey = () => Object.keys(directionKeys).find(function(key) { return directionKeys[key] === true; });

        const movementSpeed = 50;

        const movementInterval = setInterval(() => { 
            const pressedKey = this.currentlyPressedKey();
            this.currentDirection = () => pressedKey;
                
            const snakeHead = this.getHead();
            
            switch (pressedKey) {
                case '65': {
                    if (snakeHead.x - movementSpeed >= 0) {
                        snakeHead.x -= movementSpeed;
                    }
                } break; // A
                case '68': {
                    if (snakeHead.x + movementSpeed <= window.innerWidth) {
                        snakeHead.x += movementSpeed;
                    }
                } break; // D
                case '83': {
                    if (snakeHead.y + movementSpeed <= window.innerHeight) {
                        snakeHead.y += movementSpeed;
                    }
                } break; // S
                case '87': {
                    if (snakeHead.y - movementSpeed >= 0) {
                        snakeHead.y -= movementSpeed; 
                    }
                } break; // W
            }

            const snakeHasEatenItsOwnTail = this.loopThroughWithCondition((t) => {
                return t.x === snakeHead.x && t.y === snakeHead.y;
            });

            // TODO [GM]: Implement proper modal
            if (snakeHasEatenItsOwnTail) {
                confirm('You lost.');
                window.location.reload();
            }

            if (this.tailsCount() + 1 < this.passedCoordinatesCount()) {
                this.removeLastPastCoordinate();
            }

            const snakeHeadBounds = snakeHead.getBounds();
            this.addPassedCoordinate({x: snakeHeadBounds.x, y: snakeHeadBounds.y});

            this.loopThroughTails((tail, index) => {
                const coordinate = this.getPassedCoordinateAtIndex(index + 1);

                tail.x = coordinate.x;
                tail.y = coordinate.y;
            });

        }, 250);
        
        // A, D, W, S
        const allowedKeys = [65, 68, 87, 83];
        const _this = this;

        window.addEventListener('keydown', function(e) {
            if (allowedKeys.includes(e.keyCode)) {
                const currentDirection = _this.currentDirection();
                
                if (!(currentDirection === '65' && e.keyCode === 68)
                   && !(currentDirection === '68' && e.keyCode === 65)
                   && !(currentDirection === '87' && e.keyCode === 83)
                   && !(currentDirection === '83' && e.keyCode === 87)) {
                    clearSelectedDirectionKeys();
                    directionKeys[e.keyCode] = true;
                }
            }
        });

        function clearSelectedDirectionKeys() { Object.keys(directionKeys).forEach(function(key) { directionKeys[key] = false; }); }
    }
}

export default Snake;