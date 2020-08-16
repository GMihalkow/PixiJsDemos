import * as PIXI from 'pixi.js';

export default class Bird {
    constructor(birdTextures) {
        const textures = birdTextures;
        const sprite = new PIXI.Sprite(birdTextures.midFlapBird.texture);

        this.getSprite = () => sprite;

        this.xPosition = () => sprite.x;
        this.yPosition = () => sprite.y;

        this.getHeight = () => sprite.height;
        this.getWidth = () => sprite.width;

        this.incrementYPosition = (y) => sprite.y += y;
        this.decrementYPosition = (y) => sprite.y -= y;
        this.incrementXPosition = (x) => sprite.x += x;

        this.setPosition = (x, y) => sprite.position.set(x, y);

        this.setTexture = (textureName) => {
            if (!Object.keys(textures).includes(textureName)) {
                throw new Error('Invalid texture name.');
            }

            sprite.texture = textures[textureName].texture;
        };
    }
}