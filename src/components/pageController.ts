/**
 * 页面控制器
 */

import { LotteryType, LotteryNumbers } from '../types/lottery';
import { generateLotteryNumbers } from '../services/lotteryGenerator';
import { getStoredNumbers, saveNumbers, getPersonalHistory, savePersonalHistory, getUnifiedLotteryData } from '../services/lotteryStorage';
import { renderNumbers, renderStatus, updateButton, renderIntegratedHistory } from './domRenderer';
import { getCurrentZodiac, getLunarInfo, initLunarLibrary } from '../services/zodiacService';

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
    let numbers = await getStoredNumbers(lotteryType);
    
    if (!numbers) {
      // 生成新号码
      numbers = generateLotteryNumbers(lotteryType);
      await saveNumbers(lotteryType, numbers);
    } else if (numbers.purchased) {
      // 复制号码到剪贴板
      await copyLotteryNumbers(numbers);
      return; // 复制后直接返回，不需要重新渲染
    } else {
      // 标记为已购买并保存到历史记录
      numbers.purchased = true;
      await saveNumbers(lotteryType, numbers);
      
      // 添加到个人历史记录
      const history = await getPersonalHistory(lotteryType);
      history.unshift(numbers);
      
      // 只保留最近10条记录
      if (history.length > 10) {
        history.splice(10);
      }
      
      await savePersonalHistory(lotteryType, history);
      
      // 重新渲染整合历史记录
      await renderIntegratedHistory(historyId, lotteryType);
    }
    
    renderNumbers(numbersId, numbers, lotteryType);
    renderStatus(statusId, numbers);
    updateButton(buttonId, numbers);
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
    
    // 获取并显示存储的号码
    const ssqNumbers = await getStoredNumbers('ssq');
    const dltNumbers = await getStoredNumbers('dlt');
    
    if (ssqNumbers) {
      renderNumbers('ssqNumbers', ssqNumbers, 'ssq');
      renderStatus('ssqStatus', ssqNumbers);
      updateButton('ssqBtn', ssqNumbers);
    }
    
    if (dltNumbers) {
      renderNumbers('dltNumbers', dltNumbers, 'dlt');
      renderStatus('dltStatus', dltNumbers);
      updateButton('dltBtn', dltNumbers);
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