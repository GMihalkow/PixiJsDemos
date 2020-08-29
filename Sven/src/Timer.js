export default class Timer {
    constructor() {
        this._remainingSecondsCount = 60;
    }

    get remainingSecondsCount() {
        return this._remainingSecondsCount;
    }

    startCountdown() {
        const timerInterval = setInterval(() => {
            if (this._remainingSecondsCount < 0) {
                clearInterval(timerInterval);
            } else {
                this._remainingSecondsCount--;
            }
        }, 1000);
    }
}