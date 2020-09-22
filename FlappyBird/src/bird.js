import * as PIXI from 'pixi.js';
import { Howl} from 'howler';
import config from './config';

const sounds = {
    wing: new Howl({ src: ['/assets/audio/wing.wav']}),
    swoosh: new Howl({ src: ['/assets/audio/swoosh.wav']}),
    hit: new Howl({ src: ['/assets/audio/hit.wav']}),
    die: new Howl({ src: ['/assets/audio/die.wav']})    
};

export default class Bird extends PIXI.AnimatedSprite {
    constructor(color = 'blue') {
        const allowedColors = {
            blue: true,
            red: true,
            yellow: true
        };
        
        const birdColor = allowedColors[color] ? color : 'blue';

        const textures = {
            upFlapBird: PIXI.Texture.from('/assets/sprites/' + birdColor.toLowerCase() + 'bird-upflap.png'),
            midFlapBird: PIXI.Texture.from('/assets/sprites/' + birdColor.toLowerCase() + 'bird-midflap.png'),
            downFlapBird: PIXI.Texture.from('/assets/sprites/' + birdColor.toLowerCase() + 'bird-downflap.png')
        };

        const texture = Object.keys(textures).map((key) => textures[key]);

        super(texture);
        this.gotoAndPlay(0);
    }

    get isFallenDown() {
        return this.x >= (config.app.height - 100);
    }

    stopFlying() {
        this.stop();
    }

    setPosition(x, y) {
        this.position.set(x, y);
    }

    incrementYPosition(y) {
        this.position.y += y;
    }

    decrementYPosition(y) {
        this.position.y -= y;
    }

    incrementXPosition(x) {
        this.position.x += x;
    }

    playSound(soundName) {
        if (!Object.keys(sounds).includes(soundName)) {
            throw new Error('Sound not found.');
        }

        sounds[soundName].play();
    };

    _pickTexture(color) {
        const textures = {
            upFlapBird: PIXI.Texture.from('/assets/sprites/' + color.toLowerCase() + 'bird-upflap.png'),
            midFlapBird: PIXI.Texture.from('/assets/sprites/' + color.toLowerCase() + 'bird-midflap.png'),
            downFlapBird: PIXI.Texture.from('/assets/sprites/' + color.toLowerCase() + 'bird-downflap.png')
        };

        return Object.keys(textures).map((key) => textures[key]);
    }
}