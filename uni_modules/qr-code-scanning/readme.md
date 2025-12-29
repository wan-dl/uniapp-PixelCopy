# 二维码扫描模块

基于 Google ML Kit 的二维码扫描功能。

## 使用方法

```typescript
import { startScan, stopScan } from '@/uni_modules/qr-code-scanning'

// 开始扫描
startScan({
  success: (res) => {
    console.log('扫描成功:', res.result)
  },
  fail: (res) => {
    console.log('扫描失败:', res.error)
  }
})

// 停止扫描
stopScan()
```

## 权限说明

需要相机权限：`android.permission.CAMERA`
