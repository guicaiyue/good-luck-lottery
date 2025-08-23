/**
 * 存储工具函数
 */

/**
 * 检查Chrome Extension Storage API是否可用
 */
function isExtensionStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * 从存储中获取数据
 */
export async function getStorageData(key: string): Promise<any> {
  try {
    if (isExtensionStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null);
        });
      });
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error('Error getting storage data:', error);
    return null;
  }
}

/**
 * 向存储中保存数据
 */
export async function setStorageData(key: string, data: any): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: data }, () => {
          resolve();
        });
      });
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error setting storage data:', error);
  }
}

/**
 * 从存储中删除数据
 */
export async function removeStorageData(key: string): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => {
          resolve();
        });
      });
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing storage data:', error);
  }
}

/**
 * 清空所有存储数据
 */
export async function clearAllStorageData(): Promise<void> {
  try {
    if (isExtensionStorageAvailable()) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
          resolve();
        });
      });
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing storage data:', error);
  }
}