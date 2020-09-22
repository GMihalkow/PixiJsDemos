import * as PIXI from 'pixi.js';
import { Howl } from 'howler';
import Bird from './bird';
import Score from './score';
import utils from './utils';
import config from './config';

// pixi dev tools doesn't work without this
window.PIXI = PIXI;

const pointSound = new Howl({ src: ['/assets/audio/point.wav'] })

window.addEventListener('DOMContentLoaded', function () {
    const app = new PIXI.Application({
        width: config.app.width,
        height: config.app.height,
        backgroundColor: 0xFFFFFF
    });

    document.querySelector('body').appendChild(app.view);

    app.renderer.view.style.display = 'block';
    app.renderer.view.style.margin = '5rem auto';

    PIXI.Loader.shared
        .add('bg', '/assets/sprites/background-night.png')
        .add('greenPipe', '/assets/sprites/pipe-green.png')
        .add('floor', '/assets/sprites/base.png')
        .add('startMessage', '/assets/sprites/message.png')
        .add('gameOverSign', '/assets/sprites/gameover.png')
        .load((loader, resources) => {
            const mainContainer = new PIXI.Container();
            app.stage.addChild(mainContainer);

            const bg = new PIXI.TilingSprite(resources.bg.texture, config.app.width, config.app.height);
            mainContainer.addChild(bg);

            const floorContainer = new PIXI.Container();
            app.stage.addChild(floorContainer);

            const floor = new PIXI.TilingSprite(resources.floor.texture, config.app.width, 100);
            floor.y = config.app.height - 100;
            floorContainer.addChild(floor);

            const bird = new Bird('red');

            mainContainer.addChild(bird);

            bird.setPosition(20, config.app.height / 2);

            let initialPipeXCoordinate = 200;
            const pipes = [];
            const pipesCount = 11;

            for (let index = 0; index < pipesCount; index++) {
                const bottomPipe = new PIXI.Sprite(resources.greenPipe.texture);
                mainContainer.addChild(bottomPipe);

                const pipeStartYCoordinate = utils.getRandomInt(config.app.height - bottomPipe.height, 350);
                bottomPipe.position.set(initialPipeXCoordinate, pipeStartYCoordinate);

                const upperPipe = new PIXI.Sprite(resources.greenPipe.texture);
                mainContainer.addChild(upperPipe);
                upperPipe.scale.y = -1;
                upperPipe.position.set(initialPipeXCoordinate, pipeStartYCoordinate - 150);

                initialPipeXCoordinate += 200;

                pipes.push(bottomPipe);
                pipes.push(upperPipe);
            }

            const score = new Score(config.app.width / 2, config.app.height / 2 - 150);
            app.stage.addChild(score.getContainer());

            let fallingDown = true;
            let isDead = false;
            let isStarted = false;

            const startMessage = new PIXI.Sprite(resources.startMessage.texture);
            startMessage.position.set((config.app.width / 2) - (startMessage.width / 2), config.app.height / 2 - 200);
            mainContainer.addChild(startMessage);

            window.addEventListener('mousedown', function (e) {
                // button - 0 === left mouse click
                if (e.button === 0 && fallingDown && !isDead && isStarted) {
                    bird.playSound('wing');
                    fallingDown = false;

                    setTimeout(() => {
                        fallingDown = true;
                        bird.playSound('swoosh');
                    }, 300);
                } else if (e.button === 0 && !isStarted) {
                    isStarted = true;

                    startMessage.destroy();
                    mainContainer.removeChild(startMessage);
                }
            });

            let passedPipesCount = 0;
            const pipesMovementSpeed = 2;
            let isGameOver = false;

            app.ticker.add(() => {
                // sprite anchor is (0,0) by default
                const overlappingPipe = pipes.find((pipe) =>
                    (((bird.x + bird.width) >= pipe.x) && (bird.x <= (pipe.x + pipe.width))) &&
                    ((pipe.scale.y === 1 && (bird.y + bird.height) >= pipe.y) ||
                        (pipe.scale.y === -1 && (bird.y <= pipe.y))));

                if (overlappingPipe || bird.isFallenDown) {
                    isDead = true;
                    bird.stopFlying();
                }

                if (!isDead && isStarted) {
                    pipes.forEach((pipe) => {
                        pipe.x -= pipesMovementSpeed;

                        if ((pipe.x + pipe.width) <= 0) {
                            const newBottomPipe = pipes.shift();
                            const newUpperPipe = pipes.shift();
                            newUpperPipe.scale.y = -1;

                            const initialYCoordinate = utils.getRandomInt(config.app.height - newBottomPipe.height, 350);
                            newUpperPipe.y = initialYCoordinate - 150;
                            newUpperPipe.x = pipes[pipes.length - 1].x + 200;

                            newBottomPipe.y = initialYCoordinate
                            newBottomPipe.x = pipes[pipes.length - 1].x + 200;

                            pipes.push(newBottomPipe);
                            pipes.push(newUpperPipe);

                            pointSound.play();

                            passedPipesCount++;

                            const digits = score.getDigits();
                            score.clearDigits();

                            const newDigits = (parseInt(digits.join('')) + 1).toString().split('');
                            score.generateDigits(newDigits);
                        }
                    });
                } else {
                    if (!isGameOver && isStarted) {
                        isGameOver = true;

                        bird.playSound('hit');
                        bird.playSound('die');

                        score.clearDigits();

                        const gameOverSignSprite = new PIXI.Sprite(resources.gameOverSign.texture);
                        mainContainer.addChild(gameOverSignSprite);

                        gameOverSignSprite.y = config.app.height / 2 - 100;
                        gameOverSignSprite.x = (config.app.width / 2) - (gameOverSignSprite.width / 2);
                    }
                }

                if (!isDead && isStarted) {
                    if (fallingDown) {
                        bird.incrementYPosition(3);
                    } else {
                        bird.decrementYPosition(5);
                    }
                } else {
                    if (bird.y < floor.y && isStarted) {
                        bird.incrementYPosition(3);
                    }
                }
            });
        });
});