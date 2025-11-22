declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): Solar;

    getLunar(): Lunar;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getEightChar(): EightChar;
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getYearZhiWuXing(): string;

    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthZhiWuXing(): string;

    getDayGan(): string;
    getDayZhi(): string;
    getDayZhiWuXing(): string;

    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeZhiWuXing(): string;
  }

  export class LunarUtil {
    static WU_XING_GAN: { [key: string]: string };
    static WU_XING_ZHI: { [key: string]: string };
    static SHI_SHEN: { [key: string]: string };
    static CHANG_SHENG: string[];
    static GAN: string[];
    static ZHI: string[];
    static ANIMAL: string[];
  }
}
