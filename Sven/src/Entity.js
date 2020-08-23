import { AnimatedSprite, Loader } from 'pixi.js';
import gsap from 'gsap';

const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'];
const maxWalkAnimationsCount = 11;

export default class Entity {
    constructor(animations) {
        this._animations = [];
        this.direction;

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

    async walk(nextCordinates) {
        this._sprite.textures = this._animations['walk' + this._direction];
        this._sprite.gotoAndPlay(0);
        this._sprite.animationSpeed = 0.2;
        this._sprite.loop = false;

        await gsap.to(this._sprite, { x: nextCordinates.x, y: nextCordinates.y, duration: 0.5 });

        this.isMoving = false;
        // this.setDirection();
    }
}