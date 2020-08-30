import Entity from './Entity';
import Sound from './Sound';
import sheepAnimations from './sheepAnimations';
import gsap from 'gsap';

export default class Sheep extends Entity {
    constructor() {
        super(sheepAnimations);

        this._puffSmokeSound = new Sound('./src/assets/puffSmoke.wav', false, 0.2);
    }

    async disappear(callback) {
        await gsap.to(this._sprite, { alpha: 0.5, yoyo: true, repeat: 5 });

        this._puffSmokeSound.play();

        this._sprite.textures = this._animations['disappear'];
        this._sprite.gotoAndPlay(0);
        this._sprite.loop = false;

        this._sprite.onComplete = () => {
            this._sprite.onComplete = null;

            if (callback && typeof callback === 'function') {
                callback();
            }

            this._sprite.visible = false;
            this._sprite.destroy();
        }
    }
}