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

## 5. Development Workflow

### 5.1 Standard Modification Workflow
After modifying any `.uts` or `.uvue` files, **always** follow this verification cycle:
1. **Fetch build logs** to check for compilation errors
2. **Analyze errors** against the constraints in Section 3
3. **Fix issues** and wait for recompilation
4. **Repeat** until compilation succeeds

### 5.2 Build Verification Commands
```bash
# Android platform
npm run logcat:app-android

# iOS platform
npm run logcat:app-ios

# If no logs appear, fetch the last build output
npm run logcat:app-android -- --mode lastBuild
npm run logcat:app-ios -- --mode lastBuild
```

## 6. AI Agent Commands & Workflows

### 6.1 Fix Compilation Errors

**Objective**: Resolve all build errors until the project compiles successfully.

**Workflow**:
1. **Fetch logs** using the appropriate command:
   - Android: `npm run logcat:app-android`
   - iOS: `npm run logcat:app-ios`
2. **Analyze errors** by cross-referencing with Section 3 (Solved Pitfalls & Coding Standards)
3. **Apply fixes** to the relevant `.uts` or `.uvue` files
4. **Wait** for HBuilderX to recompile (automatic on file save)
5. **Re-fetch logs** and repeat until no errors remain

**Fallback**: If logs are empty or stale, append `-- --mode lastBuild` to the command to retrieve the most recent build output.

**Common Error Patterns**:
- **Lambda syntax errors**: Check for anonymous inner classes (Section 3.1)
- **Type mismatches**: Verify `MutableList<T>` usage and explicit casting (Section 3.1)
- **Property access errors**: Ensure Java getters are accessed as properties (Section 3.1)
- **ClassCastException**: Verify `ContextCompat.getMainExecutor()` usage (Section 3.2)

### 6.2 Add New Features

**Workflow**:
1. **Review constraints** in Section 3 before writing code
2. **Follow UI specifications** in Section 4 for any UI changes
3. **Implement** the feature in the appropriate `.uts` or `.uvue` file
4. **Verify** using the workflow in Section 6.1
5. **Test** on a custom debugger base if using native APIs (CameraX, MLKit)

### 6.3 Debug Runtime Issues

**Workflow**:
1. **Check permissions**: Ensure runtime permissions are requested (Section 3.2)
2. **Review logs**: Use `npm run logcat:app-android` for runtime errors
3. **Verify threading**: Confirm UI operations run on the main thread (Section 3.2)
4. **Check lifecycle**: Ensure proper use of page lifecycle hooks (Section 3.1)

### 6.4 Write Comprehensive Test Cases

**Objective**: Create or enhance automated test cases for all pages in the project.

**Prerequisites**:
- **Read AGENTS.test.md** first to understand testing framework and API usage
- Analyze target page structure, interactions, and business logic

### 6.5 Run Tests on Target Platform

**Objective**: Execute test suites on specified platforms and analyze results.

**Prerequisites**:
- **Read AGENTS.test.md** to understand platform-specific test commands
- Ensure test cases are written and up-to-date
