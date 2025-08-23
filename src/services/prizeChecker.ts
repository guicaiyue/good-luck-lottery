/**
 * 中奖检测服务
 */

import { LotteryNumbers, WinningNumbers, LotteryType, PrizeLevel } from '../types/lottery';

/**
 * 检测中奖等级
 */
export function checkPrize(
  personalNumbers: LotteryNumbers,
  winningNumbers: WinningNumbers,
  lotteryType: LotteryType
): PrizeLevel {
  if (!personalNumbers || !winningNumbers) return null;
  
  const redMatches = personalNumbers.red.filter(num => winningNumbers.red.includes(num)).length;
  const blueMatches = personalNumbers.blue.filter(num => winningNumbers.blue.includes(num)).length;
  
  if (lotteryType === 'ssq') {
    return checkSSQPrize(redMatches, blueMatches);
  } else {
    return checkDLTPrize(redMatches, blueMatches);
  }
}

/**
 * 检测双色球中奖等级
 */
function checkSSQPrize(redMatches: number, blueMatches: number): PrizeLevel {
  if (redMatches === 6 && blueMatches === 1) return '一等奖';
  if (redMatches === 6 && blueMatches === 0) return '二等奖';
  if (redMatches === 5 && blueMatches === 1) return '三等奖';
  if (redMatches === 5 && blueMatches === 0) return '四等奖';
  if (redMatches === 4 && blueMatches === 1) return '四等奖';
  if (redMatches === 4 && blueMatches === 0) return '五等奖';
  if (redMatches === 3 && blueMatches === 1) return '五等奖';
  if (redMatches < 3 && blueMatches === 1) return '六等奖 5元';
  if (redMatches === 2 && blueMatches === 1) return '六等奖 5元';
  if (redMatches === 1 && blueMatches === 1) return '六等奖 5元';
  if (redMatches === 0 && blueMatches === 1) return '六等奖 5元';
  
  return null;
}

/**
 * 检测大乐透中奖等级
 */
function checkDLTPrize(redMatches: number, blueMatches: number): PrizeLevel {
  if (redMatches === 5 && blueMatches === 2) return '一等奖';
  if (redMatches === 5 && blueMatches === 1) return '二等奖';
  if (redMatches === 5 && blueMatches === 0) return '三等奖';
  if (redMatches === 4 && blueMatches === 2) return '四等奖';
  if (redMatches === 4 && blueMatches === 1) return '五等奖';
  if (redMatches === 3 && blueMatches === 2) return '六等奖';
  if (redMatches === 4 && blueMatches === 0) return '七等奖';
  if (redMatches === 3 && blueMatches === 1) return '八等奖';
  if (redMatches === 2 && blueMatches === 2) return '八等奖';
  if (redMatches === 3 && blueMatches === 0) return '九等奖 5元';
  if (redMatches === 1 && blueMatches === 2) return '九等奖 5元';
  if (redMatches === 2 && blueMatches === 1) return '九等奖 5元';
  if (redMatches === 0 && blueMatches === 2) return '九等奖 5元';
  
  return null;
}

/**
 * 批量检测中奖情况
 */
export function checkMultiplePrizes(
  personalHistory: LotteryNumbers[],
  winningNumbers: WinningNumbers[],
  lotteryType: LotteryType
): Array<{ personal: LotteryNumbers; winning: WinningNumbers; prize: PrizeLevel }> {
  const results: Array<{ personal: LotteryNumbers; winning: WinningNumbers; prize: PrizeLevel }> = [];
  
  personalHistory.forEach(personal => {
    winningNumbers.forEach(winning => {
      const prize = checkPrize(personal, winning, lotteryType);
      if (prize) {
        results.push({ personal, winning, prize });
      }
    });
  });
  
  return results;
}