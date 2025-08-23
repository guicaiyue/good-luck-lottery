/**
 * DOM渲染组件
 */

import { LotteryNumbers, LotteryType, WinningNumbers } from '../types/lottery';
import { formatDateShort, getDaysDifference } from '../utils/dateUtils';
import { checkPrize } from '../services/prizeChecker';
import { getPersonalHistory } from '../services/lotteryStorage';
import { getRecentWinningNumbers } from '../services/lotteryApi';

/**
 * 渲染彩票号码
 */
export function renderNumbers(containerId: string, numbers: LotteryNumbers, lotteryType: LotteryType): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '';
  
  // 渲染红球
  numbers.red.forEach(num => {
    html += `<span class="ball red-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  // 渲染蓝球
  numbers.blue.forEach(num => {
    html += `<span class="ball blue-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  container.innerHTML = html;
}

/**
 * 渲染状态信息
 */
export function renderStatus(containerId: string, numbers: LotteryNumbers): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const statusText = numbers.purchased ? '已购买 ★' : '未购买';
  const statusClass = numbers.purchased ? 'purchased' : 'not-purchased';
  
  container.innerHTML = `<span class="status ${statusClass}">${statusText}</span>`;
}

/**
 * 更新按钮状态
 */
export function updateButton(buttonId: string, numbers: LotteryNumbers | null): void {
  const button = document.getElementById(buttonId) as HTMLButtonElement;
  if (!button) return;
  
  if (numbers) {
    button.textContent = numbers.purchased ? '复制号码' : '标记购买';
    button.disabled = false;
  } else {
    button.textContent = '生成号码';
    button.disabled = false;
  }
}

/**
 * 渲染整合的历史记录对比
 */
export async function renderIntegratedHistory(containerId: string, lotteryType: LotteryType): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  try {
    const winningData = await getRecentWinningNumbers(lotteryType);
    const personalHistory = await getPersonalHistory(lotteryType);
    
    if (winningData.length === 0) {
      container.innerHTML = '<div class="no-data">暂无开奖数据</div>';
      return;
    }
    
    let html = '';
    
    // 添加待开奖期号
    html += renderPendingPeriod(winningData[0], personalHistory);
    
    // 显示历史开奖期号和对应的个人号码
    winningData.forEach(winning => {
      html += renderHistoryPeriod(winning, personalHistory, lotteryType);
    });
    
    container.innerHTML = html;
  } catch (error) {
    console.error('Error rendering integrated history:', error);
    container.innerHTML = '<div class="error">加载历史数据失败</div>';
  }
}

/**
 * 渲染待开奖期号
 */
function renderPendingPeriod(latestWinning: WinningNumbers, personalHistory: LotteryNumbers[]): string {
  const nextPeriod = latestWinning.period + 1;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  let html = '<div class="period-group">';
  html += `<div class="period-header pending">`;
  html += `<span>${nextPeriod} 期 <br/> &nbsp;${formatDateShort(todayStr)}</span>`;
  html += '<span>待开奖</span>';
  html += '</div>';
  
  // 显示今日的个人号码
  const todayRecords = personalHistory.filter(record => record.date === todayStr);
  if (todayRecords.length > 0) {
    todayRecords.forEach(record => {
      html += renderPersonalRecord(record);
    });
  } else {
    html += '<div class="personal-record">';
    html += `<div class="record-date">${formatDateShort(todayStr)}</div>`;
    html += '<div class="record-numbers">暂无号码</div>';
    html += '<div class="record-status"></div>';
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

/**
 * 渲染历史期号
 */
function renderHistoryPeriod(
  winning: WinningNumbers,
  personalHistory: LotteryNumbers[],
  lotteryType: LotteryType
): string {
  let html = '<div class="period-group">';
  html += `<div class="period-header">`;
  html += `<span>${winning.period} 期<br/> &nbsp;${formatDateShort(winning.date)}</span>`;
  html += '<div class="period-numbers">';
  
  winning.red.forEach(num => {
    html += `<span class="mini-ball mini-red-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  winning.blue.forEach(num => {
    html += `<span class="mini-ball mini-blue-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  html += '</div>';
  html += '</div>';
  
  // 查找该开奖日期当天或之前生成的个人号码
  const winningDate = new Date(winning.date);
  const relevantRecords = personalHistory.filter(record => {
    const recordDate = new Date(record.date);
    // 只显示开奖日期当天或之前的记录，且时间差不超过7天
    const timeDiff = winningDate.getTime() - recordDate.getTime();
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    return daysDiff >= 0 && daysDiff <= 7; // 开奖日期前7天内的记录
  }).slice(0, 3); // 最多显示3条
  
  if (relevantRecords.length > 0) {
    relevantRecords.forEach(record => {
      const prize = checkPrize(record, winning, lotteryType);
      html += renderPersonalRecord(record, prize);
    });
  }
  
  html += '</div>';
  return html;
}

/**
 * 渲染个人记录
 */
function renderPersonalRecord(record: LotteryNumbers, prize?: string | null): string {
  let html = '<div class="personal-record';
  if (record.purchased) html += ' purchased';
  if (prize) html += ' winner';
  html += '">';
  html += `<div class="record-date">${formatDateShort(record.date)}</div>`;
  html += '<div class="record-numbers">';
  
  record.red.forEach(num => {
    html += `<span class="mini-ball mini-red-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  record.blue.forEach(num => {
    html += `<span class="mini-ball mini-blue-ball">${num.toString().padStart(2, '0')}</span>`;
  });
  
  html += '</div>';
  html += '<div class="record-status">';
  if (record.purchased) {
    html += '<span class="star-icon">★</span>';
  }
  if (prize) {
    html += `<span class="prize-badge">${prize}</span>`;
  }
  html += '</div>';
  html += '</div>';
  
  return html;
}