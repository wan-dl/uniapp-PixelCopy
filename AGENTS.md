# AGENTS.md - Developer & AI Knowledge Base

This document serves as a guide for AI agents and developers working on the `uni-PixelCopy` project. It captures the project's architectural patterns, resolved issues, and platform-specific constraints unique to uni-app x and UTS.

## 1. Project Overview
`uni-PixelCopy` is a **uni-app x (UTS)** application for Android, demonstrating native capabilities through UTS modules:
- **Memory Monitoring**: Real-time PSS, Private Dirty, and Shared Dirty metrics.
- **Native Screenshot**: Utilizing Android's `PixelCopy` API for high-quality captures.
- **QR Code Scanning**: Integration of **CameraX** and **Google MLKit Barcode Scanning**.

## 2. Technical Stack & Constraints
- **Language**: UTS (Uni TypeScript) - transpiles to Kotlin on Android.
- **Styling**: UVUE CSS (A specialized, high-performance subset of CSS).
- **Runtime Requirement**: **Custom Debugger Base (自定义调试基座)** is mandatory for testing native modules like MLKit and CameraX.

## 3. Solved Pitfalls & Coding Standards (Critical)

### 3.1 UTS Syntax Constraints
- **No Anonymous Inner Classes**: UTS does not support the `new Interface() { ... }` syntax common in Java/Kotlin.
  - *Fix*: Always use **Lambda expressions** `() => { ... }` or `(param) => { ... }`.
- **Type Strictness**: UTS is stricter than standard TypeScript regarding Kotlin interop.
  - Use `MutableList<T>` instead of `ArrayList<T>` for lambda parameters coming from native callbacks.
  - Use explicit casting `as Obj` or `as UTSJSONObject` when assigning object literals to typed variables.
- **Property Access**: In UTS, Java-style getters like `size()` or `getMessage()` should be accessed as properties: `.size` and `.message`.
- **Implicit Boolean conversion**: UTS does not support implicit truthy/falsy checks for strings in templates.
  - *Wrong*: `v-if="!errorMsg"`
  - *Correct*: `v-if="errorMsg == ''"`
- **Page Lifecycles**: In `<script setup>`, page lifecycle functions (e.g., `onShow`, `onLoad`) are globally available and **do not** need to be imported from `@dcloudio/uni-app`.

### 3.2 Android Native Interop
- **Main Thread Executor**: Do not cast `UTSAndroid.getDispatcher('main')` to `Executor`.
  - *Fix*: Use `ContextCompat.getMainExecutor(activity)` to avoid `ClassCastException`.
- **Runtime Permissions**: Native features like the Camera **must** request permissions at runtime using `UTSAndroid.requestSystemPermission` before initialization.

### 3.3 UX & Performance Optimizations
- **Camera Startup**: To prevent the "black screen flash" during camera initialization, delay adding the `PreviewView` to the UI hierarchy until the `cameraProviderFuture` listener is triggered.

## 4. UI Design Specification

The project follows a modern, clean, card-based design system.

### 4.1. Color Palette
The color scheme is based on a Slate gray foundation with an Indigo accent for interactive elements.
- **Primary / Accent**: `#6366f1` (Indigo) - Used for primary buttons and highlights.
- **Background**: `#f8fafc` (Slate) - Used for the main page background.
- **Surface / Card BG**: `#ffffff` (White) - Used for cards and navigation bars.
- **Borders**: `#e2e8f0` (Slate) - Used for card and separator borders.
- **Text**:
    - **Headings**: `#1e293b` (Dark Slate)
    - **Subheadings / Body**: `#334155`
    - **Muted / Descriptions**: `#64748b`, `#94a3b8`
- **Semantic**:
    - **Success**: `#10b981` (Green)
    - **Error**: `#ef4444` (Red)

### 4.2. Typography
- **Headings**: App titles use a large font size (`32px`) with heavy weight (`700`).
- **Card Titles**: Feature titles within cards use a medium size (`16px`) with semi-bold weight (`600`).
- **Body / Descriptions**: Standard text is typically `12px` to `16px`.
- **Default uni-app fonts (`$uni-font-size-base`: 14px) are available but often overridden by component-specific styles.

### 4.3. Layout & Spacing
- **Core Layout**: The layout is built on Flexbox (`display: flex`).
- **Padding**: Content areas have a consistent padding of `24px`.
- **Spacing**: Gaps between elements are created using `margin` (e.g., `margin-bottom: 16px`), as the `gap` property is not supported in UVUE.
- **Action Bar**: Critical actions are placed in a distinct bar at the bottom of the screen.

### 4.4. Component Styles
- **Cards**:
    - **Shape**: `border-radius: 16px`.
    - **Appearance**: White background with a `1px` solid border (`#e2e8f0`).
    - **Padding**: `20px`.
- **Buttons**:
    - **Primary**: Pill-shaped (`border-radius: 25px`), solid Indigo background.
    - **Secondary**: Pill-shaped, white background with a gray border.
    - **Height**: A consistent height of `50px` is often used.

### 4.5. CSS Limitations in UVUE (Critical)
- **Selectors**: Only class selectors are supported. Tag selectors (e.g., `button`) and attribute selectors (e.g., `[disabled]`) are **not** supported.
- **Alignment**: `align-items: baseline` is not supported; use `flex-end` or `center`.
- **Spacing**: The `gap` property is not supported; use `margin` on individual elements.

## 5. Deployment & Debugging
- **Logcat**: Use `npm run logcat:app-android` to view compilation errors and runtime logs.
- **Standard Base Limitation**: Standard HBuilderX runtimes will fail to load the native modules. Always use a Custom Base.

## 6. 流程

- 所有的uts文件、uvue文件修改后，都需要获取项目编译日志，如果存在错误，则进行修复，直到编译成功。
