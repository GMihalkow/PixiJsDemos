export default {
    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    },
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
};