import Entity from './Entity';
import Sheep from './Sheep';
import Sound from './Sound';
import svenAnimations from './svenAnimations';
import gsap from 'gsap';

export default class Sven extends Entity {
    constructor() {
        super(svenAnimations);

        this._isHumping = false;
        this._isWalking = false;

        this._humpSound = new Sound('./src/assets/hump.wav', true, 0.1);
        this._walkSound = new Sound('./src/assets/step.mp3', true, 0.2);
    }

    get isWalking() {
        return this._isWalking;
    }

    set isWalking(val) {
        if (typeof val !== 'boolean') {
            throw new Error('Invalid isWalking type.');
        }

        if (val) {
            this._walkSound.play();
        } else {
            this._walkSound.stop();
        }

        this._isWalking = val;
    }

    get isHumping() {
        return this._isHumping;
    }

    set isHumping(val) {
        if (typeof val !== 'boolean') {
            throw new Error('Invalid isHumping type.');
        }
        
        this._isHumping = val;
    }

    async walk(nextCordinates) {
        this._sprite.textures = this._animations['walk' + this._direction];
        this._sprite.gotoAndPlay(0);
        this._sprite.animationSpeed = 0.2;
        this._sprite.loop = false;

        await gsap.to(this._sprite, { x: nextCordinates.x, y: nextCordinates.y, duration: 0.5 });

        this.isWalking = false;
    }

    async hump(sheep, sheepDissapearingCallback) {
        if (!sheep) {
            throw new Error('Sheep is undefined.');
        } else if (!(sheep instanceof Sheep)) {
            throw new Error('Sheep is not the correct type.');
        }

        this._humpSound.play();

        this._isHumping = true;
        sheep._sprite.visible = false;
        
        this._sprite.textures = this._animations['hump' + this._direction];
        this._sprite.animationSpeed = 0.15;
        this._sprite.gotoAndPlay(0);
        this._sprite.loop = true;

        this._sprite.onLoop = () => {
            if (sheep.humpedCount >= 3) {
                this._sprite.onLoop = null;
                this._sprite.loop = false;
                this.isHumping = false;

                this.setDirection();

                sheepDissapearingCallback();

                this._humpSound.stop();
            } else {
                sheep.humpedCount++;
            }
        };
    }
}