const { Solar } = require("lunar-javascript");

const solar = Solar.fromYmdHms(1990, 5, 15, 12, 30, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

console.log(
  "EightChar methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar))
);

// Try to find WuXing related methods
try {
  console.log("Year Gan:", eightChar.getYearGan());
  console.log("Year Zhi:", eightChar.getYearZhi());
  // Check if we can get WuXing from Gan/Zhi directly or if we need to look up
} catch (e) {
  console.error(e);
}
