import * as PIXI from 'pixi.js';
import SOUND from "pixi-sound";
import Bird from './bird';
import Score from './score';
import utils from './utils';
import globalConstants from './globalConstants';

// pixi dev tools doesn't work without this
window.PIXI = PIXI;

// pixi sound doesn't work without this hack
PIXI["s" + "o" + "u" + "n" + "d"] = SOUND;

const appHeight = globalConstants.appHeight;
const appWidth = window.innerWidth;

const app = new PIXI.Application({
    width: appWidth,
    height: appHeight,
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
    .add('pointSound', '/assets/audio/point.wav')
    .load((loader, resources) => {
        const mainContainer = new PIXI.Container();
        app.stage.addChild(mainContainer);

        const bg = new PIXI.TilingSprite(resources.bg.texture, appWidth, appHeight);
        mainContainer.addChild(bg);

        const floorContainer = new PIXI.Container();
        app.stage.addChild(floorContainer);

        const floor = new PIXI.TilingSprite(resources.floor.texture, appWidth, 100);
        floor.y = appHeight - 100;
        floorContainer.addChild(floor);

        const bird = new Bird();

        mainContainer.addChild(bird.getSprite());

        bird.setPosition(20, appHeight / 2);

        let initialPipeXCoordinate = 200;
        const pipes = [];
        const pipesCount = 11;
        
        for (let index = 0; index < pipesCount; index++) {
            const bottomPipe = new PIXI.Sprite(resources.greenPipe.texture);
            mainContainer.addChild(bottomPipe);

            const pipeStartYCoordinate = utils.getRandomInt(appHeight - bottomPipe.height, 350);
            bottomPipe.position.set(initialPipeXCoordinate, pipeStartYCoordinate);

            const upperPipe = new PIXI.Sprite(resources.greenPipe.texture);
            mainContainer.addChild(upperPipe);
            upperPipe.scale.y = -1;
            upperPipe.position.set(initialPipeXCoordinate, pipeStartYCoordinate - 150);

            initialPipeXCoordinate += 200;

            pipes.push(bottomPipe);
            pipes.push(upperPipe);
        }
    
        const score = new Score(appWidth / 2, appHeight / 2 - 150);
        app.stage.addChild(score.getContainer());
        
        let fallingDown = true;
        let isDead = false;
        let isStarted = false;

        const startMessage = new PIXI.Sprite(resources.startMessage.texture);
        startMessage.position.set((appWidth / 2) - (startMessage.width / 2), appHeight / 2 - 200);
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

        app.ticker.add((delta) => {
            // sprite anchor is (0,0) by default
            const overlappingPipe = pipes.find((pipe) =>
                (((bird.getX() + bird.getWidth()) >= pipe.x) && (bird.getX() <= (pipe.x + pipe.width))) &&
                    ((pipe.scale.y === 1 && (bird.getY() + bird.getHeight()) >= pipe.y) ||
                        (pipe.scale.y === -1 && (bird.getY() <= pipe.y))));

            if (overlappingPipe || bird.isFallenDown) {
                isDead = true;
            }

            if (!isDead && isStarted) {
                pipes.forEach((pipe) => {
                    pipe.x -= pipesMovementSpeed;

                    if ((pipe.x + pipe.width) <= 0) {
                        const newBottomPipe = pipes.shift();
                        const newUpperPipe = pipes.shift();
                        newUpperPipe.scale.y = -1;

                        const initialYCoordinate = utils.getRandomInt(appHeight - newBottomPipe.height, 350);
                        newUpperPipe.y = initialYCoordinate - 150;
                        newUpperPipe.x = pipes[pipes.length - 1].x + 200;

                        newBottomPipe.y = initialYCoordinate
                        newBottomPipe.x = pipes[pipes.length - 1].x + 200;

                        pipes.push(newBottomPipe);
                        pipes.push(newUpperPipe);

                        PIXI.sound.play('pointSound');

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

                    gameOverSignSprite.y = appHeight / 2 - 100;
                    gameOverSignSprite.x = (appWidth / 2) - (gameOverSignSprite.width / 2);
                }
            }

            if (!isDead && isStarted) {
                if (fallingDown) {
                    bird.incrementYPosition(3);
                } else {
                    bird.decrementYPosition(5);
                }

                bird.continueFlyingAnimation();
            } else {
                if (bird.getY() < floor.y && isStarted) {
                    bird.incrementYPosition(3);
                }
            }
        });
    });