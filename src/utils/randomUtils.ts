/**
 * 随机数生成工具函数
 */

import { getTodayString } from './dateUtils';

/**
 * 基于种子的随机数生成器
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * 生成0-1之间的随机数
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * 生成指定范围内的随机整数
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * 生成种子值
 */
export function generateSeed(): number {
  const today = getTodayString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed += today.charCodeAt(i) * (i + 1);
  }
  return seed;
}

/**
 * 从数组中随机选择指定数量的不重复元素
 */
export function selectRandomNumbers(
  random: SeededRandom,
  min: number,
  max: number,
  count: number
): number[] {
  const numbers: number[] = [];
  const available = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  
  for (let i = 0; i < count; i++) {
    const index = random.nextInt(0, available.length - 1);
    numbers.push(available[index]);
    available.splice(index, 1);
  }
  
  return numbers.sort((a, b) => a - b);
}