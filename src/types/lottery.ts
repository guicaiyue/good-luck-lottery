/**
 * 彩票相关类型定义
 */

/**
 * 彩票类型
 */
export type LotteryType = 'ssq' | 'dlt';

/**
 * 彩票号码结构
 */
export interface LotteryNumbers {
  red: number[];
  blue: number[];
  date: string;
  purchased?: boolean;
}

/**
 * 开奖数据结构
 */
export interface WinningNumbers {
  period: number;
  date: string;
  red: number[];
  blue: number[];
}

/**
 * 统一存储数据结构
 */
export interface UnifiedLotteryData {
  type: LotteryType;
  date: string;
  data: LotteryNumbers;
  timestamp: number;
}

/**
 * 中奖等级类型
 */
export type PrizeLevel = 
  | '一等奖'
  | '二等奖'
  | '三等奖'
  | '四等奖'
  | '五等奖'
  | '六等奖 5元'
  | '七等奖'
  | '八等奖'
  | '九等奖 5元'
  | null;

/**
 * 生肖信息
 */
export interface ZodiacInfo {
  name: string;
  icon: string;
}

/**
 * 农历信息
 */
export interface LunarInfo {
  date: string;
  suit: string;
}

/**
 * API响应数据结构
 */
export interface SSQApiResponse {
  state: number;
  result: Array<{
    code: string;
    date: string;
    red: string;
    blue: string;
  }>;
}

export interface DLTApiResponse {
  success: boolean;
  value: {
    list: Array<{
      lotteryDrawNum: string;
      lotteryDrawTime: string;
      lotteryDrawResult: string;
    }>;
  };
}