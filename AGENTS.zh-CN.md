# AGENTS_cn.md - 开发者与 AI 知识库

本文档为 AI 智能体和开发者提供 `uni-PixelCopy` 项目的指南。它记录了项目的架构模式、已解决的问题，以及 uni-app x 和 UTS 特有的平台约束。

## 1. 项目概述
`uni-PixelCopy` 是一个基于 **uni-app x (UTS)** 的 Android 应用，通过 UTS 模块展示原生能力:
- **内存监控**: 实时 PSS、Private Dirty 和 Shared Dirty 指标。
- **原生截图**: 使用 Android 的 `PixelCopy` API 进行高质量截图。
- **二维码扫描**: 集成 **CameraX** 和 **Google MLKit 条码扫描**。

## 2. 技术栈与约束
- **语言**: UTS (Uni TypeScript) - 在 Android 上转译为 Kotlin。
- **样式**: UVUE CSS (一个专用的高性能 CSS 子集)。
- **运行时要求**: 测试 MLKit 和 CameraX 等原生模块时，**必须使用自定义调试基座**。

## 3. 已解决的陷阱与编码规范 (关键)

### 3.1 UTS 语法约束
- **不支持匿名内部类**: UTS 不支持 Java/Kotlin 中常见的 `new Interface() { ... }` 语法。
  - *修复*: 始终使用 **Lambda 表达式** `() => { ... }` 或 `(param) => { ... }`。
- **类型严格性**: UTS 在 Kotlin 互操作方面比标准 TypeScript 更严格。
  - 对于来自原生回调的 lambda 参数，使用 `MutableList<T>` 而不是 `ArrayList<T>`。
  - 将对象字面量赋值给类型化变量时，使用显式转换 `as Obj` 或 `as UTSJSONObject`。
- **属性访问**: 在 UTS 中，Java 风格的 getter 如 `size()` 或 `getMessage()` 应作为属性访问: `.size` 和 `.message`。
- **隐式布尔转换**: UTS 不支持模板中字符串的隐式真/假检查。
  - *错误*: `v-if="!errorMsg"`
  - *正确*: `v-if="errorMsg == ''"`
- **页面生命周期**: 在 `<script setup>` 中，页面生命周期函数(如 `onShow`、`onLoad`)是全局可用的，**不需要**从 `@dcloudio/uni-app` 导入。

### 3.2 Android 原生互操作
- **主线程执行器**: 不要将 `UTSAndroid.getDispatcher('main')` 强制转换为 `Executor`。
  - *修复*: 使用 `ContextCompat.getMainExecutor(activity)` 以避免 `ClassCastException`。
- **运行时权限**: 相机等原生功能在初始化前**必须**使用 `UTSAndroid.requestSystemPermission` 请求运行时权限。

### 3.3 用户体验与性能优化
- **相机启动**: 为防止相机初始化期间出现"黑屏闪烁"，延迟将 `PreviewView` 添加到 UI 层次结构，直到 `cameraProviderFuture` 监听器被触发。

## 4. UI 设计规范

项目遵循现代、简洁、基于卡片的设计系统。

### 4.1. 调色板
配色方案基于 Slate 灰色基础，Indigo 作为交互元素的强调色。
- **主色 / 强调色**: `#6366f1` (Indigo) - 用于主按钮和高亮。
- **背景**: `#f8fafc` (Slate) - 用于主页面背景。
- **表面 / 卡片背景**: `#ffffff` (白色) - 用于卡片和导航栏。
- **边框**: `#e2e8f0` (Slate) - 用于卡片和分隔线边框。
- **文本**:
    - **标题**: `#1e293b` (深 Slate)
    - **副标题 / 正文**: `#334155`
    - **弱化 / 描述**: `#64748b`, `#94a3b8`
- **语义**:
    - **成功**: `#10b981` (绿色)
    - **错误**: `#ef4444` (红色)

### 4.2. 排版
- **标题**: 应用标题使用大字号 (`32px`) 和粗字重 (`700`)。
- **卡片标题**: 卡片内的功能标题使用中等字号 (`16px`) 和半粗字重 (`600`)。
- **正文 / 描述**: 标准文本通常为 `12px` 到 `16px`。
- **默认 uni-app 字体 (`$uni-font-size-base`: 14px) 可用，但通常被组件特定样式覆盖。

### 4.3. 布局与间距
- **核心布局**: 布局基于 Flexbox (`display: flex`)。
- **内边距**: 内容区域具有一致的 `24px` 内边距。
- **间距**: 元素之间的间隙使用 `margin` 创建(如 `margin-bottom: 16px`)，因为 UVUE 不支持 `gap` 属性。
- **操作栏**: 关键操作放置在屏幕底部的独立栏中。

### 4.4. 组件样式
- **卡片**:
    - **形状**: `border-radius: 16px`。
    - **外观**: 白色背景，`1px` 实线边框 (`#e2e8f0`)。
    - **内边距**: `20px`。
- **按钮**:
    - **主按钮**: 药丸形状 (`border-radius: 25px`)，实心 Indigo 背景。
    - **次按钮**: 药丸形状，白色背景，灰色边框。
    - **高度**: 通常使用一致的 `50px` 高度。

### 4.5. UVUE 中的 CSS 限制 (关键)
- **选择器**: 仅支持类选择器。**不支持**标签选择器(如 `button`)和属性选择器(如 `[disabled]`)。
- **对齐**: 不支持 `align-items: baseline`; 使用 `flex-end` 或 `center`。
- **间距**: 不支持 `gap` 属性; 在单个元素上使用 `margin`。

## 5. 开发工作流

### 5.1 标准修改工作流
修改任何 `.uts` 或 `.uvue` 文件后，**始终**遵循此验证循环:
1. **获取构建日志**以检查编译错误
2. **根据第 3 节的约束分析错误**
3. **修复问题**并等待重新编译
4. **重复**直到编译成功

### 5.2 构建验证命令
```bash
# Android 平台
npm run logcat:app-android

# iOS 平台
npm run logcat:app-ios

# 如果没有日志出现，获取最后的构建输出
npm run logcat:app-android -- --mode lastBuild
npm run logcat:app-ios -- --mode lastBuild
```

## 6. AI 智能体命令与工作流

### 6.1 修复编译错误

**目标**: 解决所有构建错误，直到项目编译成功。

**工作流**:
1. **获取日志**，使用适当的命令:
   - Android: `npm run logcat:app-android`
   - iOS: `npm run logcat:app-ios`
2. **分析错误**，与第 3 节(已解决的陷阱与编码规范)交叉参考
3. **应用修复**到相关的 `.uts` 或 `.uvue` 文件
4. **等待** HBuilderX 重新编译(保存文件时自动)
5. **重新获取日志**并重复，直到没有错误

**后备方案**: 如果日志为空或过时，在命令后附加 `-- --mode lastBuild` 以检索最近的构建输出。

**常见错误模式**:
- **Lambda 语法错误**: 检查匿名内部类(第 3.1 节)
- **类型不匹配**: 验证 `MutableList<T>` 使用和显式转换(第 3.1 节)
- **属性访问错误**: 确保 Java getter 作为属性访问(第 3.1 节)
- **ClassCastException**: 验证 `ContextCompat.getMainExecutor()` 使用(第 3.2 节)

### 6.2 添加新功能

**工作流**:
1. **审查约束**，在编写代码前查看第 3 节
2. **遵循 UI 规范**，对于任何 UI 更改参考第 4 节
3. **实现**功能到适当的 `.uts` 或 `.uvue` 文件
4. **验证**，使用第 6.1 节的工作流
5. **测试**，如果使用原生 API(CameraX、MLKit)，在自定义调试基座上测试

### 6.3 调试运行时问题

**工作流**:
1. **检查权限**: 确保已请求运行时权限(第 3.2 节)
2. **审查日志**: 使用 `npm run logcat:app-android` 查看运行时错误
3. **验证线程**: 确认 UI 操作在主线程上运行(第 3.2 节)
4. **检查生命周期**: 确保正确使用页面生命周期钩子(第 3.1 节)

### 6.4 编写完善测试用例

**目标**: 为项目中的所有页面创建或增强自动化测试用例。

**前提条件**:
- **首先阅读 AGENTS.test.md** 了解测试框架和 API 使用方法
- 分析目标页面结构、交互和业务逻辑

### 6.5 在目标平台运行测试

**目标**: 在指定平台执行测试套件并分析结果。

**前提条件**:
- **阅读 AGENTS.test.md** 了解平台特定的测试命令
- 确保测试用例已编写并是最新的
