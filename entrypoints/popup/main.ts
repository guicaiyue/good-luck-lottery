/**
 * Popup 主入口文件
 * 符合WXT规范的popup JavaScript入口
 */

import { initPage } from '../../src/components/pageController';

// 当DOM加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initPage);