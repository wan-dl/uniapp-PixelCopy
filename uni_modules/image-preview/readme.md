# image-preview

图片预览模块，支持放大缩小功能。

## 功能特性

- 全屏图片预览
- 双指捏合缩放（0.5x - 5x）
- 点击关闭预览
- 原生 Android 实现，性能优异

## 使用方法

```typescript
import { previewImage } from '@/uni_modules/image-preview';

// 预览图片
previewImage('/path/to/image.png');
```

## 平台支持

- ✅ Android (uni-app x)
- ❌ iOS (待实现)
- ❌ Harmony (待实现)

## API

### previewImage(imagePath: string)

打开全屏图片预览。

**参数：**
- `imagePath`: 图片文件路径

**示例：**
```typescript
previewImage('/storage/emulated/0/screenshot.png');
```

## 注意事项

- 需要在自定义调试基座中测试
- 图片路径必须是本地文件系统路径
