# 生肖彩票助手 🍀

基于生肖运势的智能彩票号码生成器浏览器插件

## 功能特性

### 🎯 核心功能
- **智能号码生成**: 基于当前生肖和日期的确定性算法生成彩票号码
- **双彩种支持**: 支持双色球和大乐透两种彩票类型
- **每日限制**: 每天只能生成一次号码，确保号码的唯一性
- **购买状态管理**: 记录号码的购买状态，避免重复购买

### 🐉 生肖主题
- **实时生肖显示**: 根据农历年份显示当前生肖
- **农历信息**: 显示当前农历日期和宜忌事项
- **运势因子**: 生肖信息作为号码生成的随机种子

### 💾 数据存储
- **本地存储**: 使用Chrome Storage API存储号码数据
- **降级方案**: 当Chrome API不可用时自动降级到localStorage
- **数据持久化**: 号码数据按日期存储，支持跨会话访问

## 技术架构

### 🛠 技术栈
- **框架**: WXT (Web Extension Toolkit)
- **语言**: TypeScript + HTML + CSS
- **依赖库**: lunar-javascript (农历计算)
- **存储**: Chrome Storage API + localStorage 降级
- **构建工具**: WXT 内置构建系统

### 📁 项目结构
```
good-luck-lottery/
├── entrypoints/
│   └── popup.html          # 弹窗页面 (UI + 逻辑)
├── public/
│   ├── icon-16.png         # 16x16 图标
│   └── icon.png            # 48x48 图标
├── wxt.config.ts           # WXT 配置文件
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目说明文档
```

## 算法设计

### 🎲 确定性随机数生成
```typescript
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}
```

### 🔢 号码生成规则
- **双色球**: 红球 1-33 选 6 个 + 蓝球 1-16 选 1 个
- **大乐透**: 前区 1-35 选 5 个 + 后区 1-12 选 2 个
- **种子计算**: `${彩票类型}-${日期}-${生肖索引}` 的哈希值

## 安装使用

### 📦 开发环境
```bash
# 安装依赖
npm install

# 开发模式 (Chrome)
npm run dev

# 开发模式 (Firefox)
npm run dev:firefox

# 构建生产版本
npm run build

# 打包扩展文件
npm run zip
```

### 🔧 浏览器安装
1. 运行 `npm run build` 构建插件
2. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `.output/chrome-mv3` 目录

### 🎮 使用方法
1. 点击浏览器工具栏中的插件图标
2. 查看当前生肖和农历信息
3. 点击「生成今日幸运号码」按钮
4. 查看生成的彩票号码
5. 点击「标记为已购买」记录购买状态

## 安全特性

### 🔒 数据安全
- **本地存储**: 所有数据仅存储在用户本地，不上传到服务器
- **无网络依赖**: 核心功能完全离线运行
- **权限最小化**: 仅请求必要的存储权限

### 🛡 错误处理
- **CDN 降级**: lunar-javascript 加载失败时提供降级方案
- **存储降级**: Chrome API 不可用时自动使用 localStorage
- **输入验证**: 严格验证所有输入参数和生成结果
- **边界检查**: 防止无限循环和异常状态

## 兼容性

### 🌐 浏览器支持
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Firefox 109+ (需使用 Firefox 构建命令)
- ✅ Safari 14+ (理论支持，未测试)

### 📱 平台支持
- ✅ Windows
- ✅ macOS
- ✅ Linux

## 开发指南

### 🔄 开发流程
1. 修改代码后，开发服务器会自动重新加载
2. 在浏览器中测试功能
3. 使用 `npm run build` 构建生产版本
4. 使用 `npm run zip` 打包发布文件

### 🐛 调试技巧
- 使用浏览器开发者工具查看控制台日志
- 检查 Chrome Storage 中的数据存储情况
- 使用 WXT 开发服务器的热重载功能

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

---

🍀 **愿好运常伴！** 🍀