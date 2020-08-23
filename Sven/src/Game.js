import { Container, Sprite, Texture } from 'pixi.js';
import Entity from './Entity';
import Map from './Map';
import svenAnimations from './svenAnimations';
import sheepAnimations from './sheepAnimations';
import gsap from 'gsap';

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
    this._sven = new Entity(svenAnimations);
    this._sven.init(this._map.coordsFromPos(this._map.posById(this._map.IDS.SVEN)[0]));

    this.addChild(this._sven._sprite);
  }

  createHerd() {
    this._map.posById(this._map.IDS.SHEEP).map((sheepPos) => this._map.coordsFromPos(sheepPos)).forEach((sheepCoordinates) => {
      const sheepEntity = new Entity(sheepAnimations);
      
      sheepEntity.row =  sheepCoordinates.row;
      sheepEntity.col =  sheepCoordinates.col;
      sheepEntity.humpedCount = 0;

      sheepEntity.init(sheepCoordinates);

      this.addChild(sheepEntity._sprite);
      this._herd.push(sheepEntity);
    });
  }

  attachKeyboardEventListeners() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  async onKeyDown({ key }) {
    if (Object.keys(DIRECTIONS).includes(key)) {
      if (this._sven.isMoving) return;

      await this.svenWalk(key);
    }
  }

  onKeyUp({ key }) {
    this._sven.setDirection();
  }

  async svenWalk(pressedKey) {
    const currentPosition = this._map.posById(this._map.IDS.SVEN)[0];
      const nextPosition = this._map.getDestination(currentPosition, DIRECTIONS[pressedKey]);
      
      // TODO [GM]: Implement humping 
      if (this._map.outOfBounds(nextPosition) || this._map.collide(nextPosition)) 
      {
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
}
