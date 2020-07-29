import * as PIXI from 'pixi.js';
import Snake from './snake';
import * as utils from './utils';

let dots = [];
const dotsCount = 5;

const app = new PIXI.Application({
	width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xFFFFFF
});

document.body.appendChild(app.view);

const container = new PIXI.Container();
app.stage.addChild(container);

const snake = new Snake(app.renderer.screen.width, app.renderer.screen.height);
container.addChild(snake.getHead());

spawnDots();

snake.beginMovement();

app.ticker.add(() => {
    const graphicBounds = snake.getHead().getBounds();

    const intersectingDotIndex = dots.findIndex(function(dot) { 
        const dotBounds =  dot.getBounds();

        return dotBounds.x + dotBounds.width > graphicBounds.x &&
            graphicBounds.x + graphicBounds.width > dotBounds.x && 
            dotBounds.y + dotBounds.height > graphicBounds.y &&
            graphicBounds.y + graphicBounds.height > dotBounds.y;
    });

    if (intersectingDotIndex > -1) {
        dots[intersectingDotIndex].destroy();
        dots = dots.filter(function(dot,index) { return index != intersectingDotIndex; });

        snake.addTail(container);
    }

    // TODO [GM]: Maybe reuse the dots without destroying them? (optimization)
    if (dots.length === 0) {
        spawnDots();
    }
});

function spawnDots() {
    let tempDotsCount = 5;

    for (let index = 0; index < tempDotsCount; index++) {
        const dot = new PIXI.Graphics();
        
        let xCoordinate = utils.default.getRandomInt(1, (app.renderer.width - 50) / 50) * 50;
        let yCoordinate = utils.default.getRandomInt(1, (app.renderer.height - 50) / 50) * 50;

        const anyTailPartHasTheSameCoordinates = snake.loopThroughWithCondition((t) => {
            return t.y == yCoordinate && t.x == xCoordinate;
        });

        if (anyTailPartHasTheSameCoordinates) {
            tempDotsCount++;
            continue;
        }

        dot.x = xCoordinate;
        dot.y = yCoordinate;

        dot.beginFill(0x00FF00);
        // TODO [GM]: Change to circles later? But I have to change the initial coordinates.
        // dot.drawCircle(0, 0, 50);
        dot.drawRect(0, 0, 50, 50);
        dot.endFill();

        dots.push(dot);
        container.addChild(dot);
    }
}