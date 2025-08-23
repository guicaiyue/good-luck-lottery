/**
 * 生肖和农历信息服务
 */

import { ZodiacInfo, LunarInfo } from '../types/lottery';

// 生肖映射
const ZODIAC_MAP: Record<string, ZodiacInfo> = {
  '鼠': { name: '鼠', icon: '🐭' },
  '牛': { name: '牛', icon: '🐮' },
  '虎': { name: '虎', icon: '🐯' },
  '兔': { name: '兔', icon: '🐰' },
  '龙': { name: '龙', icon: '🐲' },
  '蛇': { name: '蛇', icon: '🐍' },
  '马': { name: '马', icon: '🐴' },
  '羊': { name: '羊', icon: '🐑' },
  '猴': { name: '猴', icon: '🐵' },
  '鸡': { name: '鸡', icon: '🐔' },
  '狗': { name: '狗', icon: '🐶' },
  '猪': { name: '猪', icon: '🐷' }
};

// Lunar库实例
let lunarInstance: any = null;

/**
 * 初始化农历库
 */
export async function initLunarLibrary(): Promise<void> {
  try {
    // 尝试异步加载lunar-javascript库
    const { Lunar } = await import('lunar-javascript');
    lunarInstance = Lunar;
    console.log('Lunar library loaded successfully');
  } catch (error) {
    console.warn('Failed to load lunar-javascript library, using fallback:', error);
    // 使用降级方案
    lunarInstance = createFallbackLunar();
  }
}

/**
 * 创建降级的农历实例
 */
function createFallbackLunar() {
  return {
    fromDate: (date: Date) => ({
      getYearInChinese: () => '甲辰年',
      getMonthInChinese: () => '八月',
      getDayInChinese: () => '十五',
      getYearShengXiao: () => '龙'
    })
  };
}

/**
 * 获取当前生肖信息
 */
export function getCurrentZodiac(): ZodiacInfo {
  try {
    if (!lunarInstance) {
      // 如果库未初始化，返回默认值
      return { name: '龙', icon: '🐲' };
    }
    
    const today = new Date();
    const lunar = lunarInstance.fromDate(today);
    const zodiacName = lunar.getYearShengXiao();
    
    return ZODIAC_MAP[zodiacName] || { name: '龙', icon: '🐲' };
  } catch (error) {
    console.error('Error getting current zodiac:', error);
    return { name: '龙', icon: '🐲' };
  }
}

/**
 * 获取农历信息
 */
export function getLunarInfo(): LunarInfo {
  try {
    if (!lunarInstance) {
      return {
        date: '甲辰年八月十五',
        suit: '宜：祈福 忌：出行'
      };
    }
    
    const today = new Date();
    const lunar = lunarInstance.fromDate(today);
    
    const year = lunar.getYearInChinese();
    const month = lunar.getMonthInChinese();
    const day = lunar.getDayInChinese();
    
    return {
      date: `${year}${month}${day}`,
      suit: '宜：祈福 忌：出行' // 简化处理，实际可以从农历库获取更详细信息
    };
  } catch (error) {
    console.error('Error getting lunar info:', error);
    return {
      date: '甲辰年八月十五',
      suit: '宜：祈福 忌：出行'
    };
  }
}

/**
 * 检查农历库是否已初始化
 */
export function isLunarLibraryReady(): boolean {
  return lunarInstance !== null;
}