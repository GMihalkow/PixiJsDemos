import { Container, Sprite, Texture } from 'pixi.js';
import Sven from './Sven';
import Entity from './Entity';
import Map from './Map';
import svenAnimations from './svenAnimations';
import sheepAnimations from './sheepAnimations';

const DIRECTIONS = { w: 'Up', s: 'Down', a: 'Left', d: 'Right' };

/**
 * Main game stage, manages scenes/levels.
 *
 * @extends {PIXI.Container}
 */
export default class Game extends Container {
  constructor() {
    super();    
  }

  async start() {
    this.addChild(Sprite.from('background'));
    
    this._map = new Map();
    this._herd = [];
    
    this.createSven();
    this.createHerd();

    this.attachKeyboardEventListeners();
  }

  createSven() {
    this._sven = new Sven(svenAnimations);
    this._sven.init(this._map.coordsFromPos(this._map.posById(this._map.IDS.SVEN)[0]));

    this.addChild(this._sven._sprite);
  }

  createHerd() {
    this._herd = this._map.posById(this._map.IDS.SHEEP).map((sheepPos) => {
      const initialSheepPosition = this._map.coordsFromPos(sheepPos);
      
      const sheepEntity = new Entity(sheepAnimations);
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
    if (Object.keys(DIRECTIONS).includes(key)) {
      if (this._sven.isMoving) return;

      await this.svenWalk(key);
    } else if (code.toLowerCase() === 'space') {
      await this.svenHump();
    }
  }

  onKeyUp({ key }) {
    this._sven.setDirection();
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

      if (sheep._direction === this._sven._direction && !this._sven._isHumping && sheep.humpedCount < 4) {
        await this._sven.hump(sheep);
      } else if (sheep.humpedCount >= 4) {
        this._sven.setDirection();
        sheep._sprite.visible = true;
        // TODO [GM]: Implement Sheep dissapearing
      }
    }
  }
}
