
function generateRandomNumber() {
    const min = 1000; // El valor mínimo de 4 cifras
    const max = 99999; // El valor máximo de 4 cifras
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    generateRandomNumber
}