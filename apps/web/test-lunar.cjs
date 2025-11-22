const { Solar } = require("lunar-javascript");

const solar = Solar.fromYmdHms(1990, 5, 15, 12, 30, 0);
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

console.log(
  "EightChar methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar))
);

// 천간(Gan)과 지지(Zhi) 객체 확인
const yearGan = eightChar.getYearGan(); // string?
const yearZhi = eightChar.getYearZhi(); // string?

console.log("Year Gan:", yearGan, typeof yearGan);
console.log("Year Zhi:", yearZhi, typeof yearZhi);

// WuXing을 얻는 방법 찾기
// lunar-javascript에서는 Gan/Zhi 문자열 자체에서 WuXing을 얻는 유틸리티가 있을 수 있음
// 또는 EightChar 객체에 다른 메서드가 있을 수 있음

try {
  // Gan/Zhi가 문자열이라면, 이를 객체로 변환하거나 WuXing을 얻는 방법이 필요함
  // 예: LunarUtil, Gan, Zhi 클래스 등
  const { LunarUtil } = require("lunar-javascript");
  console.log("LunarUtil methods:", Object.getOwnPropertyNames(LunarUtil));
} catch (e) {
  console.log("Error checking LunarUtil:", e.message);
}
