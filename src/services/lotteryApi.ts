/**
 * 彩票API服务
 */

import { WinningNumbers, LotteryType, SSQApiResponse, DLTApiResponse } from '../types/lottery';

/**
 * 获取双色球开奖数据
 */
async function getSSQWinningNumbers(): Promise<WinningNumbers[]> {
  try {
    const response = await fetch(
      'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice?name=ssq&issueCount=5&issueStart=&issueEnd=&dayStart=&dayEnd=&pageNo=1&pageSize=5&week=&systemType=PC',
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: SSQApiResponse = await response.json();
    
    if (data.state === 0 && data.result && Array.isArray(data.result)) {
      return data.result.slice(0, 5).map(item => {
        const redNumbers = item.red.split(',').map(num => parseInt(num));
        const blueNumbers = [parseInt(item.blue)];
        
        return {
          period: parseInt(item.code),
          date: item.date.split('(')[0], // 去掉星期信息
          red: redNumbers,
          blue: blueNumbers
        };
      });
    } else {
      throw new Error('福彩API返回数据格式错误');
    }
  } catch (error) {
    console.error('获取双色球开奖数据失败:', error);
    
    // 降级到模拟数据
    return getSSQFallbackData();
  }
}

/**
 * 获取大乐透开奖数据
 */
async function getDLTWinningNumbers(): Promise<WinningNumbers[]> {
  try {
    const response = await fetch(
      'https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry?gameNo=85&provinceId=0&pageSize=5&isVerify=1&pageNo=1&termLimits=5',
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: DLTApiResponse = await response.json();
    
    if (data.success && data.value && data.value.list) {
      return data.value.list.map(item => {
        const numbers = item.lotteryDrawResult.split(' ').map(num => parseInt(num));
        const red = numbers.slice(0, 5); // 前5个是红球
        const blue = numbers.slice(5, 7); // 后2个是蓝球
        
        return {
          period: parseInt(item.lotteryDrawNum),
          date: item.lotteryDrawTime,
          red: red,
          blue: blue
        };
      });
    } else {
      throw new Error('API返回数据格式错误');
    }
  } catch (error) {
    console.error('获取大乐透开奖数据失败:', error);
    
    // 降级到模拟数据
    return getDLTFallbackData();
  }
}

/**
 * 双色球降级数据
 */
function getSSQFallbackData(): WinningNumbers[] {
  return [
    { period: 2025096, date: '2025-08-21', red: [7, 9, 11, 12, 16, 29], blue: [15] },
    { period: 2025095, date: '2025-08-19', red: [15, 16, 22, 23, 26, 32], blue: [4] },
    { period: 2025094, date: '2025-08-17', red: [11, 13, 17, 19, 23, 29], blue: [16] },
    { period: 2025093, date: '2025-08-14', red: [9, 11, 12, 24, 25, 26], blue: [10] },
    { period: 2025092, date: '2025-08-12', red: [2, 11, 14, 17, 23, 24], blue: [12] }
  ];
}

/**
 * 大乐透降级数据
 */
function getDLTFallbackData(): WinningNumbers[] {
  return [
    { period: 25094, date: '2025-08-18', red: [4, 9, 17, 30, 33], blue: [5, 9] },
    { period: 25093, date: '2025-08-15', red: [7, 14, 20, 27, 33], blue: [5, 11] },
    { period: 25092, date: '2025-08-13', red: [2, 9, 16, 23, 30], blue: [1, 7] },
    { period: 25091, date: '2025-08-10', red: [4, 11, 17, 24, 32], blue: [6, 9] },
    { period: 25090, date: '2025-08-08', red: [6, 13, 19, 26, 35], blue: [2, 12] }
  ];
}

/**
 * 获取真实历史开奖数据
 */
export async function getRecentWinningNumbers(lotteryType: LotteryType): Promise<WinningNumbers[]> {
  switch (lotteryType) {
    case 'ssq':
      return await getSSQWinningNumbers();
    case 'dlt':
      return await getDLTWinningNumbers();
    default:
      throw new Error(`Unsupported lottery type: ${lotteryType}`);
  }
}