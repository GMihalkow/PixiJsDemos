import { AnimatedSprite, Loader } from 'pixi.js';

const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'];

export default class Entity {
    constructor(animations) {
        this._animations = [];

        this.prepareAnimations(animations);
    }

    init(position) {
        const initialDirectionIndex =  Math.floor(Math.random() * DIRECTIONS.length);

        this._direction = DIRECTIONS[initialDirectionIndex];
        this._sprite = new AnimatedSprite(this._animations['stand' + this._direction]);
        this._sprite.position = position;
    }

    prepareAnimations(animations) {
        Object.keys(animations).forEach((animKey) => {
            const tempAnimations = animations[animKey].map((animName) => Loader.shared.resources[animName].texture);

            this._animations[animKey] = tempAnimations;
        });
    }

    setDirection(direction = this._direction) {
        if (DIRECTIONS.includes(direction)) {
            this._direction = DIRECTIONS.find((dir) => dir === direction);
            this._sprite.textures = this._animations['stand' + this._direction];
            this._sprite.gotoAndStop(0);
            this._sprite.loop = false;
        }
    }
}