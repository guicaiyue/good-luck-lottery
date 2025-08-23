import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: '生肖彩票助手',
    description: '基于生肖运势的智能彩票号码生成器',
    version: '1.0.0',
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      'https://api.jisuapi.com/*',
      'https://apis.juhe.cn/*', 
      'https://api.6api.net/*',
      'https://www.cwl.gov.cn/*',
      'https://webapi.sporttery.cn/*'
    ],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icon-16.png',
        '48': 'icon.png',
        '128': 'icon.png'
      }
    },
    icons: {
      '16': 'icon-16.png',
      '48': 'icon.png', 
      '128': 'icon.png'
    }
  }
});