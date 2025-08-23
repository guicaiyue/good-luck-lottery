/**
 * 主入口文件
 * 整合所有模块并初始化应用
 */

import { initPage } from './components/pageController';

// 当DOM加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initPage);

// 导出主要功能供外部使用
export * from './types/lottery';
export * from './utils/dateUtils';
export * from './utils/randomUtils';
export * from './utils/storageUtils';
export * from './services/lotteryGenerator';
export * from './services/lotteryStorage';
export * from './services/lotteryApi';
export * from './services/prizeChecker';
export * from './services/zodiacService';
export * from './components/domRenderer';
export * from './components/pageController';