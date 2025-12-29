# uni-PixelCopy

一个基于 uni-app x 的应用工具。

## 功能特性

- 实时获取应用内存使用情况
- 显示 TotalPss 内存数据
- 支持多平台部署（Android、iOS）

## 技术栈

- **框架**: uni-app x
- **语言**: UTS (TypeScript)
- **版本**: Vue 3

## 项目结构

```
├── pages/
│   └── index/           # 主页面
├── uni_modules/
│   └── app-performance-memory/  # 内存监控模块
├── static/              # 静态资源
├── App.uvue            # 应用入口
├── main.uts            # 主入口文件
├── manifest.json       # 应用配置
└── pages.json          # 页面配置
```

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/dcloud-wandl/uni-PixelCopy.git
cd uni-PixelCopy
```

2. 安装依赖
```bash
npm install
```

3. 运行项目
```bash
# 查看不同平台日志
npm run logcat:app-android    # Android
npm run logcat:app-ios        # iOS
```

## 使用说明

点击"获取app内存ok"按钮即可查看当前应用的内存使用情况，显示的数据包括：
- TotalPss: 应用总内存使用量（MB）

## 支持平台

- ✅ Android
- ✅ iOS
- ✅ Harmony

## 许可证

ISC License
