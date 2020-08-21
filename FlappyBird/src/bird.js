import * as PIXI from 'pixi.js';
import SOUND from "pixi-sound";
import globalConstants from './globalConstants';

// pixi sound doesn't work without this hack
PIXI["s" + "o" + "u" + "n" + "d"] = SOUND;

export default class Bird {
    constructor(color = 'blue') {
        const allowedColors = {
            blue: true,
            red: true,
            yellow: true
        };

        let birdColor = allowedColors[color] ? color : 'blue';

        const textures = {
            blueUpFlapBird: PIXI.Texture.from('/assets/sprites/bluebird-upflap.png'),
            blueMidFlapBird: PIXI.Texture.from('/assets/sprites/bluebird-midflap.png'),
            blueDownFlapBird: PIXI.Texture.from('/assets/sprites/bluebird-downflap.png'),
            redUpFlapBird: PIXI.Texture.from('/assets/sprites/redbird-upflap.png'),
            redMidFlapBird: PIXI.Texture.from('/assets/sprites/redbird-midflap.png'),
            redDownFlapBird: PIXI.Texture.from('/assets/sprites/redbird-downflap.png'),
            yellowUpFlapBird: PIXI.Texture.from('/assets/sprites/yellowbird-upflap.png'),
            yellowMidFlapBird: PIXI.Texture.from('/assets/sprites/yellowbird-midflap.png'),
            yellowDownFlapBird: PIXI.Texture.from('/assets/sprites/yellowbird-downflap.png')
        };

        const sprite = new PIXI.Sprite(textures[birdColor + 'MidFlapBird']);

        const sounds = {
            wing: PIXI.sound.Sound.from('/assets/audio/wing.wav'),
            swoosh: PIXI.sound.Sound.from('/assets/audio/swoosh.wav'),
            hit: PIXI.sound.Sound.from('/assets/audio/hit.wav'),
            die: PIXI.sound.Sound.from('/assets/audio/die.wav'),
        };

        this.playSound = (soundName) => {
            if (!Object.keys(sounds).includes(soundName)) {
                throw new Error('Sound not found.');
            }

            sounds[soundName].play();
        };

        this.getSprite = () => sprite;

        this.getX = () => sprite.x;
        this.getY = () => sprite.y;

        this.getHeight = () => sprite.height;
        this.getWidth = () => sprite.width;

        this.incrementYPosition = (y) => sprite.y += y;
        this.decrementYPosition = (y) => sprite.y -= y;
        this.incrementXPosition = (x) => sprite.x += x;

        this.setPosition = (x, y) => sprite.position.set(x, y);

        const allowedFlightPositions = {
            'UpFlapBird': {
                order: 0,
                enabled: false
            },
            'MidFlapBird': {
                order: 1,
                enabled: true
            },
            'DownFlapBird': {
                order: 2,
                enabled: false
            }
        };

        this.getAllowedFlightPositions = () => allowedFlightPositions;
        this.currentFlightPositionOrder = () => allowedFlightPositions[Object.keys(allowedFlightPositions).find((key) => allowedFlightPositions[key].enabled)].order;
        this.setFlightPosition = (order) => {
            if (typeof order !== 'number') {
                throw new Error('Order must be a number.');
            }

            Object.keys(allowedFlightPositions).forEach((key) => allowedFlightPositions[key].enabled = false);

            const flightPositionKey = Object.keys(allowedFlightPositions).find((key) => allowedFlightPositions[key].order === order);
            if (allowedFlightPositions[flightPositionKey]) {
                allowedFlightPositions[flightPositionKey].enabled = true;
            }
        };

        this.setTexture = (textureName) => {
            if (!Object.keys(textures).includes(birdColor + textureName)) {
                throw new Error('Invalid texture name.');
            }

            sprite.texture = textures[birdColor + textureName];
        };
    }

    get isFallenDown() {
        return this.getY() >= (globalConstants.appHeight - 100);
    }

    continueFlyingAnimation() {
        let order = this.currentFlightPositionOrder();

        if (order >= 2)  {
            order = 0;
        } else {
            order++;
        }

        this.setFlightPosition(order);

        const allowedFlightPositions = this.getAllowedFlightPositions();
        const currentPosition = Object.keys(allowedFlightPositions).find((key) => allowedFlightPositions[key].enabled);

        this.setTexture(currentPosition);
    }
}