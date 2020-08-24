import Entity from './Entity';

export default class Sven extends Entity {
    constructor(animations) {
        super(animations);

        this._isHumping = false;
    }

    async hump(sheep) {
        if (!sheep) {
            throw new Error('Sheep is undefined.');
        } else if (!(sheep instanceof Entity)) {
            throw new Error('Sheep is not the correct type.');
        }
        
        this._isHumping = true;
        sheep._sprite.visible = false;
        
        this._sprite.textures = this._animations['hump' + this._direction];
        this._sprite.gotoAndPlay(0);
        this._sprite.loop = false;

        this._sprite.onComplete = () => {
            this._sprite.onComplete = null;
            this._isHumping = false;
            sheep.humpedCount++;
        };
    }
}