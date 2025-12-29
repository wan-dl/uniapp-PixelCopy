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

### 3.2 Android Native Interop
- **Main Thread Executor**: Do not cast `UTSAndroid.getDispatcher('main')` to `Executor`.
  - *Fix*: Use `ContextCompat.getMainExecutor(activity)` to avoid `ClassCastException`.
- **Runtime Permissions**: Native features like the Camera **must** request permissions at runtime using `UTSAndroid.requestSystemPermission` before initialization.

### 3.3 UX & Performance Optimizations
- **Camera Startup**: To prevent the "black screen flash" during camera initialization, delay adding the `PreviewView` to the UI hierarchy until the `cameraProviderFuture` listener is triggered.

## 4. UI/UX Guidelines
The project follows a **Modern Minimalist (Indigo/Slate)** design system:
- **Theme Colors**: 
  - Primary: Indigo (`#6366f1`)
  - Background: Slate (`#f8fafc`)
  - Surface: White (`#ffffff`)
- **Layout Patterns**:
  - **Cards**: White background cards with `1px` Slate-200 borders and `16px` border-radius.
  - **Action Bars**: Fixed bottom areas for primary buttons.
  - **Navigation**: Clean nav bars with `18px` semi-bold titles.
- **CSS Limitations in UVUE**:
  - **Selectors**: Only class selectors are supported. Tag selectors (e.g., `button`) and attribute selectors (e.g., `[disabled]`) are **not** supported.
  - **Alignment**: `align-items: baseline` is not supported; use `flex-end` or `center`.
  - **Spacing**: The `gap` property is not supported; use `margin` on individual elements.

## 5. Deployment & Debugging
- **Logcat**: Use `npm run logcat:app-android` to view compilation errors and runtime logs.
- **Standard Base Limitation**: Standard HBuilderX runtimes will fail to load the native modules. Always use a Custom Base.
