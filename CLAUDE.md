# NoteMm 项目级 CLAUDE.md

## 项目概况

Windows 桌面便签，自由画布编辑器。Electron + React + TypeScript + SQLite + Tailwind CSS。

## 常用命令

```bash
npm run dev          # 开发模式
npm run build        # 生产构建
```

## 打包流程（三步）

```bash
# 1. 构建代码
npm run build

# 2. 构建应用 + 注入图标（signAndEditExecutable=false 跳过签名，需手动注入图标）
npx electron-builder --win --x64 --dir
npx rcedit dist/win-unpacked/NoteMm.exe --set-icon resources/icon.ico

# 3. 从注入好图标的 exe 生成 NSIS 安装包
npx electron-builder --win --x64 --prepackaged dist/win-unpacked
```

安装包在 `dist/NoteMm Setup 1.0.0.exe`。

## 架构要点

- 每张便签是独立无边框 BrowserWindow，透明背景
- `content` 存 JSON 格式 `TextBlock[]`，不是 HTML
- TextBlock 类型: `text` | `checklist` | `image`
- 主进程(`src/main/`): 数据库、窗口管理、托盘、快捷键、IPC
- preload(`src/preload/`): contextBridge，暴露 `window.electronAPI`
- 渲染进程(`src/renderer/src/`): CanvasEditor 是核心组件

## 之前踩过的坑

1. **Vite 打包后 `import { app } from 'electron'` 变成 `electron.app`** → 顶层的 `app.requestSingleInstanceLock()` 报 undefined。因为 `externalizeDepsPlugin` 没把 devDependencies 中的 electron 当作外部模块。修复：把 electron 移到 dependencies。

2. **`better-sqlite3` 需要针对 Electron 的 Node 版本编译** → 用 `npx electron-rebuild` 重新编译。

3. **编辑面板事件和画布事件冲突** → 编辑面板渲染为画布的兄弟节点（独立 overlay），不放在画布 DOM 内，彻底隔离。

4. **React useCallback 闭包过期** → 用 `useRef` 保存最新状态，回调中用 `ref.current`。

5. **Windows 打包 winCodeSign 7z 解压失败** → 需要管理员权限才能创建 macOS symlink。解决方法：`signAndEditExecutable: false`，然后手动用 `rcedit` 注入图标。

6. **`require('./database')` 在 Vite 打包后找不到文件** → 所有 main 进程代码被打包成单文件，不能用动态 require。统一用静态 import。

7. **打包时 `electron` 必须在 `devDependencies`** → electron-builder 强制要求。开发时放 `dependencies` 是为了让 `externalizeDepsPlugin` 正常工作，打包前需要挪到 `devDependencies`。现在已经在 `devDependencies`。

## 换图标

1. 替换 `resources/tray-icon.png`（托盘用，任意尺寸）
2. 重新生成 `resources/icon.ico`（桌面快捷方式用，需 256x256 PNG 转 ICO）
3. 重新走打包流程
