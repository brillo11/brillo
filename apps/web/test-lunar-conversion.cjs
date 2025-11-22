const { Lunar } = require("lunar-javascript");

const lunar = Lunar.fromYmdHms(1981, 1, 21, 12, 0, 0, false);
console.log(`Input Lunar: 1981-01-21 12:00:00`);
console.log(`Converted Solar: ${lunar.getSolar().toFullString()}`);
console.log(`Solar Year: ${lunar.getSolar().getYear()}`);
console.log(`Solar Month: ${lunar.getSolar().getMonth()}`);
console.log(`Solar Day: ${lunar.getSolar().getDay()}`);
