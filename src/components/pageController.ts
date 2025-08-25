/**
 * 页面控制器
 */

import { LotteryType, LotteryNumbers } from '../types/lottery';
import { generateLotteryNumbers } from '../services/lotteryGenerator';
import { getStoredNumbers, saveNumbers, getPersonalHistory, savePersonalHistory, getUnifiedLotteryData } from '../services/lotteryStorage';
import { renderNumbers, renderStatus, updateButton, renderIntegratedHistory } from './domRenderer';
import { getCurrentZodiac, getLunarInfo, initLunarLibrary } from '../services/zodiacService';
import { getTodayString } from '../utils/dateUtils';

/**
 * 复制彩票号码到剪贴板
 */
async function copyLotteryNumbers(numbers: LotteryNumbers): Promise<void> {
  try {
    // 格式化号码，红球和蓝球之间用空格分隔
    const redNumbers = numbers.red.map(num => num.toString().padStart(2, '0')).join(' ');
    const blueNumbers = numbers.blue.map(num => num.toString().padStart(2, '0')).join(' ');
    const formattedNumbers = `${redNumbers} | ${blueNumbers}`;
    
    await navigator.clipboard.writeText(formattedNumbers);
    
    // 显示复制成功提示
    const notification = document.createElement('div');
    notification.textContent = '号码已复制到剪贴板！';
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // 2秒后移除提示
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 2000);
    
  } catch (error) {
    console.error('复制失败:', error);
    // 降级方案：显示号码让用户手动复制
    const redNumbers = numbers.red.map(num => num.toString().padStart(2, '0')).join(' ');
    const blueNumbers = numbers.blue.map(num => num.toString().padStart(2, '0')).join(' ');
    alert(`复制失败，请手动复制：${redNumbers} | ${blueNumbers}`);
  }
}

/**
 * 输出当前缓存的幸运号码信息
 */
async function logCurrentCachedNumbers(): Promise<void> {
  try {
    console.log('=== 当前缓存的幸运号码信息 ===');
    console.log('存储键(Storage Key): unified_lottery_data');
    
    const allData = await getUnifiedLotteryData();
    console.log('缓存数据总数:', allData.length);
    
    // 输出双色球号码
    const ssqNumbers = await getStoredNumbers('ssq');
    console.log('双色球(SSQ)当前号码:', ssqNumbers);
    
    // 输出大乐透号码
    const dltNumbers = await getStoredNumbers('dlt');
    console.log('大乐透(DLT)当前号码:', dltNumbers);
    
    // 输出所有缓存数据的概览
    console.log('所有缓存数据概览:');
    allData.forEach((item, index) => {
      console.log(`${index + 1}. 类型: ${item.type}, 日期: ${item.date}, 数据类型: ${item.dataType}`);
    });
    
    console.log('=== 缓存信息输出完毕 ===');
  } catch (error) {
    console.error('输出缓存信息时出错:', error);
  }
}

/**
 * 处理按钮点击事件
 */
export async function handleButtonClick(lotteryType: LotteryType): Promise<void> {
  const numbersId = `${lotteryType}Numbers`;
  const statusId = `${lotteryType}Status`;
  const buttonId = `${lotteryType}Btn`;
  const historyId = `${lotteryType}IntegratedHistory`;
  
  try {
    // 基于数据状态决策：若今日已有号码（含已购买），则复制；否则生成
    let numbers = await getTodayNumbersIncludingPurchased(lotteryType);
    
    if (numbers) {
      await copyLotteryNumbers(numbers);
      return;
    }
    
    // 今日尚无号码：生成并保存
    numbers = generateLotteryNumbers(lotteryType);
    await saveNumbers(lotteryType, numbers);
    
    renderNumbers(numbersId, numbers, lotteryType);
    renderStatus(statusId, numbers);
    updateButton(buttonId, numbers);
    
    // 渲染历史（以便列表显示今日“未购买”记录）
    await renderIntegratedHistory(historyId, lotteryType);
  } catch (error) {
    console.error(`Error handling ${lotteryType} button click:`, error);
  }
}

/**
 * 初始化页面切换功能
 */
export function initPageSwitcher(): void {
  const categoryBtns = document.querySelectorAll('.category-btn');
  const welfarePage = document.getElementById('welfarePage');
  const sportsPage = document.getElementById('sportsPage');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = (btn as HTMLElement).dataset.category;
      
      // 更新按钮状态
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 切换页面
      if (category === 'welfare') {
        welfarePage?.classList.remove('hidden');
        sportsPage?.classList.add('hidden');
      } else {
        welfarePage?.classList.add('hidden');
        sportsPage?.classList.remove('hidden');
      }
    });
  });
}

/**
 * 初始化生肖和农历信息
 */
export function initZodiacAndLunar(): void {
  const zodiac = getCurrentZodiac();
  const zodiacIcon = document.getElementById('zodiacIcon');
  const zodiacName = document.getElementById('zodiacName');
  
  if (zodiacIcon) zodiacIcon.textContent = zodiac.icon;
  if (zodiacName) zodiacName.textContent = zodiac.name;
  
  const lunarInfo = getLunarInfo();
  const lunarDate = document.getElementById('lunarDate');
  const lunarSuit = document.getElementById('lunarSuit');
  
  if (lunarDate) lunarDate.textContent = lunarInfo.date;
  if (lunarSuit) lunarSuit.textContent = lunarInfo.suit;
}

/**
 * 初始化彩票号码显示
 */
export async function initLotteryDisplay(): Promise<void> {
  try {
    // 渲染整合的历史记录
    await renderIntegratedHistory('ssqIntegratedHistory', 'ssq');
    await renderIntegratedHistory('dltIntegratedHistory', 'dlt');
    
    // 获取并显示存储的号码（包含已购买的今日号码）
    const ssqToday = await getTodayNumbersIncludingPurchased('ssq');
    const dltToday = await getTodayNumbersIncludingPurchased('dlt');
    
    if (ssqToday) {
      renderNumbers('ssqNumbers', ssqToday, 'ssq');
      renderStatus('ssqStatus', ssqToday);
      updateButton('ssqBtn', ssqToday);
    }
    
    if (dltToday) {
      renderNumbers('dltNumbers', dltToday, 'dlt');
      renderStatus('dltStatus', dltToday);
      updateButton('dltBtn', dltToday);
    }
  } catch (error) {
    console.error('Error initializing lottery display:', error);
  }
}

/**
 * 绑定事件监听器
 */
export function bindEventListeners(): void {
  const ssqBtn = document.getElementById('ssqBtn');
  const dltBtn = document.getElementById('dltBtn');
  
  if (ssqBtn) {
    ssqBtn.addEventListener('click', () => handleButtonClick('ssq'));
  }
  
  if (dltBtn) {
    dltBtn.addEventListener('click', () => handleButtonClick('dlt'));
  }
}

/**
 * 初始化页面
 */
export async function initPage(): Promise<void> {
  try {
    // 首先初始化lunar库
    await initLunarLibrary();
    
    // 初始化页面切换器
    initPageSwitcher();
    
    // 初始化生肖和农历信息
    initZodiacAndLunar();
    
    // 初始化彩票显示
    await initLotteryDisplay();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 输出当前缓存的幸运号码信息
    await logCurrentCachedNumbers();
    
    console.log('Page initialized successfully');
  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

/**
 * 获取今日号码（包含已购买的情况）
 *
 * 优先返回当日未购买的“当前号码”；若没有，则回退到个人历史中“今日且已购买”的记录。
 */
async function getTodayNumbersIncludingPurchased(lotteryType: LotteryType): Promise<LotteryNumbers | null> {
  // 先查未购买（当前缓存）
  const current = await getStoredNumbers(lotteryType);
  if (current) return current;
  
  // 回退到历史里查找今天的记录（通常为已购买）
  const today = getTodayString();
  const history = await getPersonalHistory(lotteryType);
  const purchasedToday = history.find(h => h.date === today) || null;
  return purchasedToday || null;
}