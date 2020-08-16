import * as PIXI from 'pixi.js'
import SOUND from "pixi-sound";
import utils from './utils';

// pixi dev tools doesn't work without this
window.PIXI = PIXI;

// pixi sound doesn't work without this hack
PIXI["s" + "o" + "u" + "n" + "d"] = SOUND;

const appHeight = 512;
const appWidth = 512 * 3;

const app = new PIXI.Application({
    width: appWidth,
    height: appHeight,
    backgroundColor: 0xFFFFFF
});

document.querySelector('body').appendChild(app.view);

app.renderer.view.style.display = 'block';
app.renderer.view.style.margin = '5rem auto';

PIXI.Loader.shared
    .add('0', '/assets/sprites/0.png')
    .add('1', '/assets/sprites/1.png')
    .add('2', '/assets/sprites/2.png')
    .add('3', '/assets/sprites/3.png')
    .add('4', '/assets/sprites/4.png')
    .add('5', '/assets/sprites/5.png')
    .add('6', '/assets/sprites/6.png')
    .add('7', '/assets/sprites/7.png')
    .add('8', '/assets/sprites/8.png')
    .add('9', '/assets/sprites/9.png')
    .add('bg', '/assets/sprites/background-night.png')
    .add('midFlapBird', '/assets/sprites/bluebird-midflap.png')
    .add('upFlapBird', '/assets/sprites/bluebird-upflap.png')
    .add('downFlapBird', '/assets/sprites/bluebird-downFlap.png')
    .add('greenPipe', '/assets/sprites/pipe-green.png')
    .add('floor', '/assets/sprites/base.png')
    .add('pointSound', '/assets/audio/point.wav')
    .add('wingSound', '/assets/audio/wing.wav')
    .add('swooshSound', '/assets/audio/swoosh.wav')
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

        let score = [new PIXI.Sprite(resources['0'].texture)];

        score.forEach((scoreDigit) => {
            mainContainer.addChild(scoreDigit);
            
            scoreDigit.y = appHeight / 2 - 150;
            scoreDigit.x = appWidth / 2;
        });

        const bird = new PIXI.Sprite(resources.midFlapBird.texture);
        mainContainer.addChild(bird);

        bird.position.set(20, appHeight / 2);

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
        
        let fallingDown = true;
        
        window.addEventListener('keydown', function(e) {
            if (fallingDown) {
                if (e.keyCode == 87) {
                    PIXI.sound.play('wingSound');
                    fallingDown = false;
                    
                    setTimeout(() => {
                        fallingDown = true;
                        PIXI.sound.play('swooshSound');
                    }, 300);
                }
            }
        });
        
        let passedPipesCount = 0;

        app.ticker.add(() => {
            const birdHasFellDown = bird.y >= (appHeight - 100);

            // sprite anchor is (0,0) by default
            const overlappingPipe = pipes.find((pipe) => 
                (((bird.x + bird.width) >= pipe.x) && (bird.x <= (pipe.x + pipe.width))) && 
                    !pipe.passed && 
                        ((pipe.scale.y === 1 && (bird.y + bird.height) >= pipe.y) || 
                            (pipe.scale.y === -1 && (bird.y <= pipe.y))));
            
                if (overlappingPipe || birdHasFellDown) {
                    alert('game over');
                }

            pipes.forEach((pipe) => {
                // TODO [GM]: Extract speed to a constant?
                pipe.x -= 2;

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
                    newBottomPipe.passed = false;

                    PIXI.sound.play('pointSound');

                    passedPipesCount++;

                    score.forEach((scoreDigit) => {
                        scoreDigit.destroy();
                        mainContainer.removeChild(scoreDigit);
                    });

                    score = generateScoreNumber(passedPipesCount, resources);

                    score.forEach((scoreDigit, index) => {
                        mainContainer.addChild(scoreDigit);
            
                        scoreDigit.y = appHeight / 2 - 150;
                        scoreDigit.x = appWidth / 2;

                        if (index > 0) {
                            scoreDigit.x += scoreDigit.width * index;
                            
                            if (passedPipesCount.toString().indexOf('1') > 0) {
                                scoreDigit.x += 10;
                            }
                        }
                    });
                }
            });

            bird.texture = resources['midFlapBird'].texture;

            if (fallingDown) {
                bird.y += 3;
                bird.texture = resources['downFlapBird'].texture;
            } else {
                bird.y -= 5;
                bird.texture = resources['upFlapBird'].texture;
            }
        });
    });

function generateScoreNumber(passedPipesCount, resources) {
    const passedPipesCountDigits = passedPipesCount.toString().split('');

    return passedPipesCountDigits.map((digit) => new PIXI.Sprite(resources[digit].texture));
}