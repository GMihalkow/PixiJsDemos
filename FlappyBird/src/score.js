import * as PIXI from 'pixi.js';

export default class Score {
    constructor(x, y) {
        this.getX = () => x;
        this.getY = () => y;

        const textures = {
            '0': PIXI.Texture.from('/assets/sprites/0.png'),
            '1': PIXI.Texture.from('/assets/sprites/1.png'),
            '2': PIXI.Texture.from('/assets/sprites/2.png'),
            '3': PIXI.Texture.from('/assets/sprites/3.png'),
            '4': PIXI.Texture.from('/assets/sprites/4.png'),
            '5': PIXI.Texture.from('/assets/sprites/5.png'),
            '6': PIXI.Texture.from('/assets/sprites/6.png'),
            '7': PIXI.Texture.from('/assets/sprites/7.png'),
            '8': PIXI.Texture.from('/assets/sprites/8.png'),
            '9': PIXI.Texture.from('/assets/sprites/9.png')
        };

        this.getTextures = () => textures;

        const digits = [];

        this.getDigits = () => digits.map((d) => d.number);

        // TODO [GM]: validate
        this.addDigit = (digit) => {
            if (digit && digit.number && digit.sprite) {
                digits.push(digit);
            }
        };

        this.clearDigits = () => {
            digits.forEach((d) => d.sprite.destroy());

            while (digits.length > 0) {
                digits.pop();
            }
        };

        const container = new PIXI.Container();
        this.getContainer = () => container;

        const scoreNumbers = ['0'];
        this.generateDigits(scoreNumbers);
    }

    generateDigits(numbers) {
        const sprites = numbers.map((d) => { 
            return {
                number: d.toString(),
                sprite: new PIXI.Sprite(this.getTextures()[d.toString()])
            };
        });
        
        sprites.forEach((digit, index) => {
            this.getContainer().addChild(digit.sprite);
            
            digit.sprite.y = this.getY();
            digit.sprite.x = this.getX();
            
            if (index > 0) {
                digit.sprite.x += digit.sprite.width * index;
                
                if (numbers.length > 1 && digit.number === '1') {
                    digit.sprite.x += 10;
                }
            }

            this.addDigit(digit);
        });
    }
}