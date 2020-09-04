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

        const currentBirdColorTextures = Object.keys(textures).filter((key) => key.startsWith(birdColor)).map((key) => textures[key]);
        const sprite = new PIXI.AnimatedSprite(currentBirdColorTextures);
        sprite.gotoAndPlay(0);

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

        this.stopFlying = () => {
            sprite.stop();
        }
    }

    get isFallenDown() {
        return this.getY() >= (globalConstants.appHeight - 100);
    }
}