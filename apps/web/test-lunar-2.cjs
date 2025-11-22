const { LunarUtil } = require("lunar-javascript");

console.log("WU_XING_GAN:", LunarUtil.WU_XING_GAN);
console.log("WU_XING_ZHI:", LunarUtil.WU_XING_ZHI);

// 천간 '갑'의 오행 찾기
const gan = "甲";
const zhi = "子";

// 배열이라면 인덱스로 찾아야 함.
// Gan 순서: 甲乙丙丁戊己庚辛壬癸
// Zhi 순서: 子丑寅卯辰巳午未申酉戌亥

const ganIndex = LunarUtil.GAN.indexOf(gan);
const zhiIndex = LunarUtil.ZHI.indexOf(zhi);

console.log(`Gan ${gan} index:`, ganIndex);
console.log(`Zhi ${zhi} index:`, zhiIndex);

if (ganIndex >= 0) {
  console.log(`Gan ${gan} WuXing:`, LunarUtil.WU_XING_GAN[ganIndex]);
}

if (zhiIndex >= 0) {
  console.log(`Zhi ${zhi} WuXing:`, LunarUtil.WU_XING_ZHI[zhiIndex]);
}
