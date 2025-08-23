/**
 * 彩票数据存储服务
 */

import { LotteryNumbers, LotteryType, UnifiedLotteryData, WinningNumbers } from '../types/lottery';
import { getStorageData, setStorageData } from '../utils/storageUtils';
import { getTodayString, isToday } from '../utils/dateUtils';

// 统一存储键
const STORAGE_KEY = 'unified_lottery_data';

/**
 * 获取统一的彩票数据
 */
export async function getUnifiedLotteryData(): Promise<UnifiedLotteryData[]> {
  try {
    const data = await getStorageData(STORAGE_KEY);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error getting unified lottery data:', error);
    return [];
  }
}

/**
 * 保存统一的彩票数据
 */
export async function saveUnifiedLotteryData(data: UnifiedLotteryData[]): Promise<void> {
  try {
    await setStorageData(STORAGE_KEY, data);
  } catch (error) {
    console.error('Error saving unified lottery data:', error);
  }
}

/**
 * 获取存储的彩票号码
 */
export async function getStoredNumbers(lotteryType: LotteryType): Promise<LotteryNumbers | null> {
  try {
    const allData = await getUnifiedLotteryData();
    const today = getTodayString();
    
    // 查找今天的号码数据（通过purchased状态区分：未购买的是当前号码，已购买的是历史记录）
    const todayEntry = allData.find(item => 
      item.type === lotteryType && 
      item.date === today &&
      !item.data.purchased
    );
    
    return todayEntry ? todayEntry.data : null;
  } catch (error) {
    console.error('Error getting stored numbers:', error);
    return null;
  }
}

/**
 * 保存彩票号码
 */
export async function saveNumbers(lotteryType: LotteryType, numbers: LotteryNumbers): Promise<void> {
  try {
    let allData = await getUnifiedLotteryData();
    const today = getTodayString();
    
    // 清理过期缓存
    allData = await cleanExpiredCache(lotteryType);
    
    // 移除今天的旧当前号码数据（未购买的）
    allData = allData.filter(item => 
      !(item.type === lotteryType && item.date === today && !item.data.purchased)
    );
    
    // 添加新数据
    const newEntry: UnifiedLotteryData = {
      type: lotteryType,
      date: today,
      data: numbers,
      timestamp: Date.now()
    };
    
    allData.push(newEntry);
    
    // 按日期倒序排序
    allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    await saveUnifiedLotteryData(allData);
  } catch (error) {
    console.error('Error saving numbers:', error);
  }
}

/**
 * 获取个人历史记录
 */
export async function getPersonalHistory(lotteryType: LotteryType): Promise<LotteryNumbers[]> {
  try {
    const allData = await getUnifiedLotteryData();
    
    // 查找对应彩种的个人历史记录（包括已购买和未购买的号码）
    const historyEntries = allData.filter(item => 
      item.type === lotteryType
    );
    
    // 按日期倒序排序并提取数据
    const history = historyEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(item => item.data);
    
    return history;
  } catch (error) {
    console.error('Error getting personal history:', error);
    return [];
  }
}

/**
 * 保存个人历史记录
 */
export async function savePersonalHistory(lotteryType: LotteryType, history: LotteryNumbers[]): Promise<void> {
  try {
    let allData = await getUnifiedLotteryData();
    
    // 清理过期缓存
    allData = await cleanExpiredCache(lotteryType);
    
    // 移除该彩种的旧历史记录数据（已购买的号码）
    allData = allData.filter(item => 
      !(item.type === lotteryType && item.data.purchased)
    );
    
    // 为每条历史记录创建单独的存储条目
    history.forEach(record => {
      const newEntry: UnifiedLotteryData = {
        type: lotteryType,
        date: record.date,
        data: record,
        timestamp: Date.now()
      };
      allData.push(newEntry);
    });
    
    // 按日期倒序排序
    allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    await saveUnifiedLotteryData(allData);
  } catch (error) {
    console.error('Error saving personal history:', error);
  }
}

/**
 * 清理过期缓存
 */
export async function cleanExpiredCache(lotteryType: LotteryType): Promise<UnifiedLotteryData[]> {
  try {
    let allData = await getUnifiedLotteryData();
    
    // 清理过期缓存（保留最近30天的数据）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];
    
    const filteredData = allData.filter(item => {
      if (item.type !== lotteryType) return true;
      
      // 对于未购买的号码，只保留今天的数据
      if (!item.data.purchased) {
        return item.date === getTodayString();
      }
      
      // 对于已购买的历史记录，保留最近30天的数据
      if (item.data.purchased) {
        return item.date >= thirtyDaysAgoString;
      }
      
      return true;
    });
    
    await saveUnifiedLotteryData(filteredData);
    
    return filteredData;
  } catch (error) {
    console.error('Error cleaning expired cache:', error);
    return await getUnifiedLotteryData();
  }
}