import Entity from './Entity';
import Sheep from './Sheep';
import svenAnimations from './svenAnimations';
import gsap from 'gsap';

export default class Sven extends Entity {
    constructor() {
        super(svenAnimations);

        this._isHumping = false;
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

        this.isMoving = false;
    }

    async hump(sheep, sheepDissapearingCallback) {
        if (!sheep) {
            throw new Error('Sheep is undefined.');
        } else if (!(sheep instanceof Sheep)) {
            throw new Error('Sheep is not the correct type.');
        }
        
        this._isHumping = true;
        sheep._sprite.visible = false;
        
        this._sprite.textures = this._animations['hump' + this._direction];
        this._sprite.gotoAndPlay(0);
        this._sprite.loop = true;

        this._sprite.onLoop = () => {
            if (sheep.humpedCount >= 3) {
                this._sprite.onLoop = null;
                this._sprite.loop = false;
                this.isHumping = false;

                this.setDirection();

                sheepDissapearingCallback();
            } else {
                sheep.humpedCount++;
            }
        };
    }
}