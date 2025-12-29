# Android PixelCopy 截图插件

基于Android PixelCopy API实现的uni-app x截图插件。

## 功能特性

- 使用Android原生PixelCopy API进行截图
- 支持Android API 26+的高性能截图
- 自动降级到View.draw方法兼容低版本
- 返回截图文件路径和尺寸信息

## 使用方法

```typescript
import { captureScreen } from '@/uni_modules/android-PixedCopy';

// 截图
captureScreen({
  success: (res) => {
    console.log('截图成功:', res.filePath);
    console.log('尺寸:', res.width, 'x', res.height);
  },
  fail: (err) => {
    console.log('截图失败:', err.errMsg);
  }
});
```

## 支持平台

- ✅ Android (API 21+)
- ❌ iOS
- ❌ Web
- ❌ 小程序

## 注意事项

- 需要存储权限
- 截图文件保存在应用外部文件目录
- Android 8.0+使用PixelCopy API，低版本使用View.draw
