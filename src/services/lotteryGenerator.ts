/**
 * 彩票号码生成服务
 */

import { LotteryNumbers, LotteryType } from '../types/lottery';
import { SeededRandom, generateSeed, selectRandomNumbers } from '../utils/randomUtils';
import { getTodayString } from '../utils/dateUtils';

/**
 * 生成双色球号码
 */
export function generateSSQNumbers(): LotteryNumbers {
  const seed = generateSeed();
  const random = new SeededRandom(seed);
  
  // 生成6个红球号码 (1-33)
  const red = selectRandomNumbers(random, 1, 33, 6);
  
  // 生成1个蓝球号码 (1-16)
  const blue = [random.nextInt(1, 16)];
  
  return {
    red,
    blue,
    date: getTodayString(),
    purchased: false
  };
}

/**
 * 生成大乐透号码
 */
export function generateDLTNumbers(): LotteryNumbers {
  const seed = generateSeed();
  const random = new SeededRandom(seed);
  
  // 生成5个红球号码 (1-35)
  const red = selectRandomNumbers(random, 1, 35, 5);
  
  // 生成2个蓝球号码 (1-12)
  const blue = selectRandomNumbers(random, 1, 12, 2);
  
  return {
    red,
    blue,
    date: getTodayString(),
    purchased: false
  };
}

/**
 * 根据彩票类型生成号码
 */
export function generateLotteryNumbers(lotteryType: LotteryType): LotteryNumbers {
  switch (lotteryType) {
    case 'ssq':
      return generateSSQNumbers();
    case 'dlt':
      return generateDLTNumbers();
    default:
      throw new Error(`Unsupported lottery type: ${lotteryType}`);
  }
}