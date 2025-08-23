/**
 * 日期处理工具函数
 */

/**
 * 获取今日日期字符串 (YYYY-MM-DD格式)
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期为MM-DD格式
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
}

/**
 * 计算两个日期之间的天数差
 */
export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 检查日期是否为今天
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}