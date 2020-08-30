import { Howl } from 'howler';

export default class Sound {
    constructor(track, loop = false, volume = null) {
        this._player = new Howl({
            src: [track],
            volume: volume ? volume : 1,
            loop: loop
        });
    }

    play() {
        this._player.play();
    }

    stop() {
        this._player.stop();
    }
}