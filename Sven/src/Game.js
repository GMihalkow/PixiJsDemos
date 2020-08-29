import { Container, Sprite, Text, Loader } from 'pixi.js';
import Sven from './Sven';
import Sheep from './Sheep';
import Map from './Map';
import Timer from './Timer';

const DIRECTIONS = { w: 'Up', s: 'Down', a: 'Left', d: 'Right' };

/**
 * Main game stage, manages scenes/levels.
 *
 * @extends {PIXI.Container}
 */
export default class Game extends Container {
  constructor() {
    super();

    this._gameHasEnded = false;
    this._map = new Map();
    this._herd = [];
  }

  get humpedSheepCount() {
    return 8 - this._herd.length;
  }

  async start() {
    this.addChild(Sprite.from('background'));
    
    this.createSven();
    this.createHerd();

    this.attachKeyboardEventListeners();

    const timer = new Timer();
    timer.startCountdown();

    const timerNumbers = new Text(timer.remainingSecondsCount.toString(), { fontFamily: 'Arial', fontWeight: 'bold' });

    timerNumbers.position.set(45, 35);
    this.addChild(timerNumbers);

    const scoreBoardNumbers = new Text(this.humpedSheepCount.toString(),  { fontFamily: 'Arial', fontWeight: 'bold', fontSize: 20 });
    scoreBoardNumbers.position.set(720 - 75, 25);
    this.addChild(scoreBoardNumbers);

    const _this = this;

    function gameLoop() {
      requestAnimationFrame(gameLoop);

      if (timer.remainingSecondsCount <= 0 && !_this._gameHasEnded) {
        _this._gameHasEnded = true;
      }

      let timerNextValue = timer.remainingSecondsCount.toString();

      if (timer.remainingSecondsCount < 10) {
        timerNextValue = '0' + timerNextValue;
      }

      timerNumbers.text = timerNextValue;
      scoreBoardNumbers.text = '0' + _this.humpedSheepCount.toString();

      if (timer.remainingSecondsCount < 0 && _this._gameHasEnded && _this.children.length > 1) {
        _this.endGame();
      }
    };

    gameLoop();
  }
  
  createSven() {
    this._sven = new Sven();
    this._sven.init(this._map.coordsFromPos(this._map.posById(this._map.IDS.SVEN)[0]));

    this.addChild(this._sven._sprite);
  }

  createHerd() {
    this._herd = this._map.posById(this._map.IDS.SHEEP).map((sheepPos) => {
      const initialSheepPosition = this._map.coordsFromPos(sheepPos);
      
      const sheepEntity = new Sheep();
      sheepEntity.init(initialSheepPosition);

      sheepEntity.row = sheepPos.row;
      sheepEntity.col = sheepPos.col;
      sheepEntity.humpedCount = 0;

      this.addChild(sheepEntity._sprite);

      return sheepEntity;
    });
  }

  attachKeyboardEventListeners() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  async onKeyDown({ key, code }) {
    if (Object.keys(DIRECTIONS).includes(key) && !this._sven.isHumping) {
      if (this._sven.isMoving) return;

      await this.svenWalk(key);
    } else if (code.toLowerCase() === 'space') {
      await this.svenHump();
    }
  }

  onKeyUp() {
    if (!this._sven.isHumping) {
      this._sven.setDirection();
    }
  }

  async svenWalk(pressedKey) {
    const currentPosition = this._map.posById(this._map.IDS.SVEN)[0];
    const nextPosition = this._map.getDestination(currentPosition, DIRECTIONS[pressedKey]);
    
    if (this._map.outOfBounds(nextPosition) || this._map.collide(nextPosition)) {
      this._sven.setDirection(DIRECTIONS[pressedKey]);
      return;
    }
    
    this._sven.isMoving = true;
    
    this._map.setTileOnMap(currentPosition, this._map.IDS.EMPTY);
    this._map.setTileOnMap(nextPosition, this._map.IDS.SVEN);
    
    this._sven.setDirection(DIRECTIONS[pressedKey]);

    const nextCordinates = this._map.coordsFromPos(nextPosition);
    
    await this._sven.walk(nextCordinates);
  }

  async svenHump() {
    const nextPosition = this._map.getDestination(this._map.posById(this._map.IDS.SVEN)[0], this._sven._direction);
    const isNextIndexASheep = this._map.getTile(nextPosition) === this._map.IDS.SHEEP;
  
    if (isNextIndexASheep) {
      const sheep = this._herd.find((sh) => sh.row === nextPosition.row && sh.col === nextPosition.col);

      if (sheep._direction === this._sven._direction && !this._sven.isHumping && sheep.humpedCount < 4) {
        await this._sven.hump(sheep, async () => {
          this._sven.setDirection();
          
          sheep._sprite.visible = true;
          await sheep.disappear(() => {
            this._map.setTileOnMap({ row: sheep.row, col: sheep.col }, this._map.IDS.EMPTY);

            const sheepIndex = this._herd.findIndex((sh) => sh.col === sheep.col && sheep.row === sh.row);

            if (sheepIndex > -1) {
              this._herd.splice(sheepIndex, 1);
            }

            if (this._herd.length === 0) {
              this.endGame();
            }
          });
        });
      }
    }
  }
 
  endGame() {
    while(this.children.length) {
      this.children.pop();
    }

    const endScreenSprite = new Sprite(Loader.shared.resources['endBackground'].texture);
    this.addChild(endScreenSprite);
  }
}