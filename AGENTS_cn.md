# AGENTS_cn.md - 开发者与 AI 知识库

本文档是为 `uni-PixelCopy` 项目的 AI 代理和开发人员提供的一份指南。它记录了该项目的架构模式、已解决的问题以及 uni-app x 和 UTS 特有的平台限制。

## 1. 项目概述
`uni-PixelCopy` 是一个基于 **uni-app x (UTS)** 的安卓应用，通过 UTS 模块展示了原生功能：
- **内存监控**: 实时监测 PSS、Private Dirty 和 Shared Dirty 指标。
- **原生截图**: 利用安卓的 `PixelCopy` API 进行高质量截图。
- **二维码扫描**: 集成 **CameraX** 和 **Google MLKit 条码扫描**。

## 2. 技术栈与约束
- **语言**: UTS (Uni TypeScript) - 在安卓上转译为 Kotlin。
- **样式**: UVUE CSS (一种专用的、高性能的 CSS 子集)。
- **运行要求**: 测试 MLKit 和 CameraX 等原生模块时，**必须**使用**自定义调试基座**。

## 3. 已解决的陷阱与编码规范 (关键)

### 3.1 UTS 语法约束
- **无匿名内部类**: UTS 不支持 Java/Kotlin 中常见的 `new Interface() { ... }` 语法。
  - *修复*: 始终使用 **Lambda 表达式** `() => { ... }` 或 `(param) => { ... }`。
- **类型严格性**: 在与 Kotlin 的互操作性方面，UTS 比标准 TypeScript 更严格。
  - 对于来自原生回调的 lambda 参数，请使用 `MutableList<T>` 而不是 `ArrayList<T>`。
  - 将对象字面量赋给类型化变量时，请使用显式转换 `as Obj` 或 `as UTSJSONObject`。
- **属性访问**: 在 UTS 中，应像访问属性一样访问 Java 风格的 getter 方法，例如 `size()` 或 `getMessage()` 应写为 `.size` 和 `.message`。
- **隐式布尔转换**: UTS 不支持在模板中对字符串进行隐式的真/假值判断。
  - *错误*: `v-if="!errorMsg"`
  - *正确*: `v-if="errorMsg == ''"`
- **页面生命周期**: 在 `<script setup>` 中，页面生命周期函数（如 `onShow`, `onLoad` 等）是全局可用的，**不需要**从 `@dcloudio/uni-app` 手动导入。

### 3.2 安卓原生互操作
- **主线程执行器**: 不要将 `UTSAndroid.getDispatcher('main')` 转换为 `Executor`。
  - *修复*: 使用 `ContextCompat.getMainExecutor(activity)` 以避免 `ClassCastException`。
- **运行时权限**: 像相机这样的原生功能**必须**在初始化之前，使用 `UTSAndroid.requestSystemPermission` 在运行时请求权限。

### 3.3 用户体验与性能优化
- **相机启动**: 为防止相机初始化过程中的“黑屏闪烁”，应延迟将 `PreviewView` 添加到 UI 层级中，直到 `cameraProviderFuture` 监听器被触发。

## 4. UI 设计规范

该项目遵循一个现代、简洁、基于卡片的设计体系。

### 4.1. 色彩系统
配色方案基于 Slate 灰色系，并以 Indigo 靛蓝色作为交互元素的强调色。
- **主色 / 强调色**: `#6366f1` (Indigo) - 用于主按钮和高亮显示。
- **背景色**: `#f8fafc` (Slate) - 用于主页面背景。
- **表面 / 卡片背景**: `#ffffff` (White) - 用于卡片和导航栏。
- **边框色**: `#e2e8f0` (Slate) - 用于卡片和分隔线的边框。
- **文本颜色**:
    - **标题**: `#1e293b` (深 Slate)
    - **副标题 / 正文**: `#334155`
    - **弱化 / 描述**: `#64748b`, `#94a3b8`
- **语义化颜色**:
    - **成功**: `#10b981` (绿色)
    - **失败**: `#ef4444` (红色)

### 4.2. 字体规范
- **标题**: 应用标题使用大号字体 (`32px`) 和粗体 (`700`)。
- **卡片标题**: 卡片内的功能标题使用中号字体 (`16px`) 和中粗体 (`600`)。
- **正文 / 描述**: 标准文本通常为 `12px` 到 `16px`。
- **默认 uni-app 字体** (`$uni-font-size-base`: 14px) 可用，但通常被组件特定样式覆盖。

### 4.3. 布局与间距
- **核心布局**: 布局基于 Flexbox (`display: flex`) 构建。
- **内边距**: 内容区域有统一的 `24px` 内边距。
- **间距**: 元素之间的间隙通过 `margin` 创建 (例如, `margin-bottom: 16px`)，因为 UVUE 不支持 `gap` 属性。
- **操作栏**: 关键操作被放置在屏幕底部的独立操作栏中。

### 4.4. 组件样式
- **卡片**:
    - **形状**: `border-radius: 16px`。
    - **外观**: 白色背景，带有 `1px` 实心边框 (`#e2e8f0`)。
    - **内边距**: `20px`。
- **按钮**:
    - **主按钮**: 胶囊形状 (`border-radius: 25px`)，实心 Indigo 背景。
    - **次要按钮**: 胶囊形状，白色背景配灰色边框。
    - **高度**: 通常使用 `50px` 的统一高度。

### 4.5. UVUE 中的 CSS 限制 (关键)
- **选择器**: 仅支持类选择器。不支持标签选择器 (例如, `button`) 和属性选择器 (例如, `[disabled]`)。
- **对齐**: 不支持 `align-items: baseline`；请使用 `flex-end` 或 `center`。
- **间距**: 不支持 `gap` 属性；请在单个元素上使用 `margin`。

## 5. 部署与调试
- **Logcat**: 使用 `npm run logcat:app-android` 查看编译错误和运行时日志。
- **标准基座限制**: 标准的 HBuilderX 运行环境无法加载原生模块。务必使用自定义基座。

## 6. 流程

- 所有的uts文件、uvue文件修改后，都需要获取项目编译日志，如果存在错误，则进行修复，直到编译成功。
