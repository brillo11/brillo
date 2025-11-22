const { Solar, Lunar, LunarUtil } = require("lunar-javascript");

const solar = Solar.fromYmdHms(1999, 4, 18, 19, 10, 0); // 예시 날짜
const lunar = solar.getLunar();
const eightChar = lunar.getEightChar();

console.log("--- 십성 (ShiShen) ---");
// 일간(Day Gan)을 기준으로 다른 간지의 십성을 구함
const dayGan = eightChar.getDayGan();
console.log("일간:", dayGan);

// LunarUtil.SHI_SHEN 등을 이용하거나 EightChar 메서드 확인
// 이전 출력에서 SHI_SHEN이 있었음.
console.log("LunarUtil.SHI_SHEN:", LunarUtil.SHI_SHEN);

// 십이운성 (ChangSheng / Yun)
console.log("--- 십이운성 (ChangSheng) ---");
console.log("LunarUtil.CHANG_SHENG:", LunarUtil.CHANG_SHENG);

// 십이신살 (ShenSha)
console.log("--- 십이신살 (ShenSha) ---");
// ShenSha 관련 메서드가 있는지 확인
console.log(
  "EightChar methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar))
);
console.log(
  "Lunar methods:",
  Object.getOwnPropertyNames(Object.getPrototypeOf(lunar))
);

// 음양오행 상세
console.log("--- 음양오행 ---");
const gan = "甲";
// 음양 확인
// LunarUtil에 YIN_YANG 관련이 있는지?
console.log(
  "LunarUtil keys:",
  Object.keys(LunarUtil).filter((k) => k.includes("YIN") || k.includes("YANG"))
);
