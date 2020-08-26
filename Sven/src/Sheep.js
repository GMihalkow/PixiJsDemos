import Entity from './Entity';
import sheepAnimations from './sheepAnimations';
import gsap from 'gsap';

export default class Sheep extends Entity {
    constructor() {
        super(sheepAnimations);
    }

    async disappear() {
        await gsap.to(this._sprite, { alpha: 0.5, yoyo: true, repeat: 5 });

        this._sprite.textures = this._animations['disappear'];
        this._sprite.gotoAndPlay(0);
        this._sprite.loop = false;

        this._sprite.onComplete = () => {
            this._sprite.onComplete = null;
            this._sprite.visible = false;
            this._sprite.destroy();
        }
    }
}