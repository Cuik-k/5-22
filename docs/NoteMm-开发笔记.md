# NoteMm 开发笔记

## 项目概述

NoteMm 是一款 Windows 桌面便签软件。核心特点是**自由画布式排版**——文字、清单、图片可以拖拽到便签内的任意位置，像贴纸一样自由排列。

- **名称**: NoteMm
- **平台**: Windows 10/11
- **技术栈**: Electron + React + TypeScript + SQLite + Tailwind CSS
- **开发周期**: 2026-05-22 ~ 2026-05-23（2天）
- **代码仓库**: https://github.com/Cuik-k/5-22

---

## 一、需求设计阶段

### 1.1 核心需求确认

在开始编码前，逐条确认了所有需求，避免返工：

1. **数据存储**: 纯本地 SQLite，不需要网络
2. **便签置顶**: 每张便签可独立设置是否置顶
3. **富文本格式**: 加粗、斜体、下划线、列表、文字颜色、背景色
4. **外观自定义**: 颜色、字体、圆角、阴影、透明度可调
5. **待办清单**: 便签内嵌可勾选的 checkbox
6. **自由拖拽摆放**: 多张便签可自由拖到屏幕任意位置
7. **控制面板**: 主面板列表管理、搜索、批量操作
8. **系统托盘**: 后台常驻，托盘图标 + 右键菜单
9. **全局快捷键**: Ctrl+Shift+N 新建便签等
10. **自动保存 + 启动恢复**: 500ms 防抖，重启精确复原

### 1.2 技术选型决策

| 技术 | 选型 | 理由 |
|---|---|---|
| 框架 | Electron + React + TS | 跨平台能力强，界面好看，生态好 |
| 数据存储 | better-sqlite3 | 同步 API，Electron 主进程无压力 |
| 初始编辑器 | TipTap (ProseMirror) | 底层模型清晰，扩展性强 |
| 最终编辑器 | 自研 Canvas 画布 | 后期改为自由排版，见下文 |
| 构建工具 | electron-vite + Vite | 启动快，HMR 热更新 |
| 样式 | Tailwind CSS | 原子化样式，外观定制灵活 |

### 1.3 数据模型设计

```sql
CREATE TABLE notes (
  id            TEXT PRIMARY KEY,
  title         TEXT DEFAULT '',
  content       TEXT DEFAULT '',      -- JSON 格式 TextBlock[]
  color         TEXT DEFAULT '#FFE066',
  font_size     TEXT DEFAULT '14px',
  opacity       REAL DEFAULT 0.92,
  border_radius TEXT DEFAULT '8px',
  shadow        TEXT DEFAULT 'medium',
  x             REAL DEFAULT 200,
  y             REAL DEFAULT 200,
  width         REAL DEFAULT 360,
  height        REAL DEFAULT 400,
  pinned        INTEGER DEFAULT 0,
  is_checklist  INTEGER DEFAULT 0,
  sort_order    INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
```

---

## 二、开发阶段

### 2.1 第一阶段：基础设施搭建（提交 55cdf0b ~ 1a4d40f）

**内容**: 
- 项目脚手架（electron-vite + React + TS + Tailwind）
- 共享类型定义（Note、AppSettings、IPC 通道）
- SQLite 数据库层（CRUD、搜索、排序）
- 设置存储（electron-store）
- 窗口管理器（便签窗口、控制面板、设置页）
- 系统托盘 + 全局快捷键
- IPC 桥接（preload + contextBridge）

**关键决策**:
- 每张便签是独立的 `BrowserWindow`，无边框、透明背景
- 主进程管数据 + 窗口，渲染进程管 UI，通过 IPC 通信
- `content` 字段最初存 HTML，后期改为 JSON

### 2.2 第二阶段：渲染层（提交 c2f06e7）

**内容**:
- React 入口基于 hash 路由（`#/note/:id`、`#/panel`、`#/settings`）
- TipTap 富文本编辑器 + 悬停高亮 + 拖拽文字扩展
- 便签工具栏（标题编辑、置顶、删除）+ 状态栏（外观面板、清单模式、复选框）
- 控制面板（搜索、便签列表、右键菜单、拖拽排序）
- 设置页（通用、快捷键录制、数据导入导出）

### 2.3 第三阶段：架构重大变更（提交 10342f0）

**转折点**: 用户提出"文字可以自由拖拽到便签内任意位置定位"，这超出了 TipTap 线性排版的能力。

**决策**: **放弃 TipTap，自研 Canvas 画布编辑器**

#### 新架构

```
TextBlock {
  id, type: 'text' | 'checklist' | 'image',
  text, x, y, fontSize, fontFamily,
  color, bold, italic, underline, underlineColor,
  checked, src, blockWidth, blockHeight
}
```

**核心机制**:
- 每个文本/清单/图片块是独立的绝对定位元素
- 点击画布空白 → 创建文字块
- 右键画布空白 → 创建清单块
- 鼠标悬停高亮 → 按住拖拽移动
- 右键文字块 → 弹出编辑面板（输入框 + 格式工具栏）
- 拖图片文件到画布 → 自动创建图片块，支持缩放

**关键挑战**: 编辑面板的事件和画布事件互相冲突

**解决方案**: 将编辑面板从画布内部移出，作为独立的 overlay 层渲染，完全隔离事件系统。

#### 交互模式设计

| 操作 | 行为 |
|---|---|
| 左键空白区 | 已有编辑→保存并关闭；再点→新建文字块 |
| 右键空白区 | 新建清单块 |
| 鼠标悬停文字 | 黄色高亮 |
| 按住拖拽文字 | 移动到任意位置 |
| 右键文字块 | 弹出格式编辑面板 |
| 拖图片进入 | 创建可缩放的图片块 |
| 右键图片 | 删除图片 |

---

## 三、遇到的难点和解决方案

### 3.1 Electron 模块加载 Bug（最耗时）

**问题**: 在 Windows 上 `require('electron')` 返回的是 `.exe` 路径字符串，而不是 `{ app, BrowserWindow }` 等 API 对象。

**原因**: 这是 Electron 在 Windows 上的已知 Bug ([#49034](https://github.com/electron/electron/issues/49034))。`node_modules/electron/index.js` 遮蔽了 Electron 的内建模块。

**排查过程**:
1. 测试 Electron 27、28、30、32 四个版本 → 全部存在
2. 尝试删除 `node_modules/electron` → `require('electron')` 直接找不到模块
3. 尝试 `require('electron/main')` → 同样失败
4. 尝试 `process._linkedBinding` → segfault
5. 确认 `process.type` 为 `undefined`、`process.activateUvLoop` 缺失

**最终解决**: 用户的 `npm install` 使用了 `--ignore-scripts` 跳过了 electron 的 postinstall 脚本。让用户用**完整 `npm install`**（不含 `--ignore-scripts`），electron 的安装脚本正常运行后，内建模块加载就正常了。

**教训**: native 模块的 postinstall 脚本不能随便跳过。

### 3.2 better-sqlite3 编译失败

**问题**: `better-sqlite3` 需要 C++ 编译环境，Windows 上缺少 Visual Studio Build Tools。

**解决**: 
1. 安装 `@electron/rebuild`
2. 运行 `npx electron-rebuild` 为 Electron 的 Node.js 版本重新编译原生模块

### 3.3 编辑面板事件冲突

**问题**: 编辑面板（input、select、按钮）在画布 div 内部，画布的 `onClick` 和 `onMouseDown` 事件与表单元素的原生交互冲突。下拉框选不中、按钮点不动。

**排查过程**:
1. 先用 `stopPropagation` → 无效，仍被拦截
2. 改用 `onMouseDown` → select 下拉被阻止
3. 改用 `onClick` → 仍然冲突

**最终解决**: 将编辑面板从画布 DOM 树中**完全移出**，作为独立 overlay 层渲染。画布事件和编辑面板事件完全隔离，互不干扰。

**关键代码**:
```tsx
{/* 画布 - 处理点击、拖拽、右键 */}
<div ref={canvasRef} onMouseDown={...} onContextMenu={...}>
  {blocks.map(b => <Block ... />)}
</div>

{/* 编辑面板 - 独立于画布之外 */}
{editingBlock && (
  <EditOverlay ... />
)}
```

### 3.4 状态闭包过期

**问题**: React `useCallback` 中的 `editingBlock` 和 `blocks` 状态经常是旧值。用户改字体后点画布外部，内容丢失。

**解决**: 使用 `useRef` 保存最新状态引用，回调中始终用 `ref.current` 而非闭包中的旧值：

```typescript
const editingRef = useRef<TextBlock | null>(null)
const blocksRef = useRef<TextBlock[]>(blocks)
blocksRef.current = blocks // 每次渲染同步

const saveAndClose = useCallback(() => {
  const eb = editingRef.current // 始终是最新值
  const cur = blocksRef.current
  // ...
}, [onChange])
```

### 3.5 打包时签名工具下载失败

**问题**: `electron-builder` 需要从 GitHub 下载 winCodeSign 等工具，用户网络连 GitHub 不稳定。

**解决**: 
1. Electron 本体用 npmmirror 镜像下载
2. 配置 `ELECTRON_MIRROR` 环境变量
3. `signAndEditExecutable: false` 跳过数字签名（不影响功能，用户安装时会弹"未知发布者"警告）

---

## 四、项目结构

```
NoteMm/
├── src/
│   ├── shared/types.ts          # 共享类型 (Note, TextBlock, IPC)
│   ├── main/
│   │   ├── index.ts             # 主进程入口
│   │   ├── database.ts          # SQLite CRUD
│   │   ├── ipc-handlers.ts      # IPC 处理器
│   │   ├── window-manager.ts    # 窗口生命周期
│   │   ├── tray.ts              # 系统托盘
│   │   ├── shortcuts.ts         # 全局快捷键
│   │   └── settings-store.ts    # electron-store
│   ├── preload/index.ts         # contextBridge
│   └── renderer/src/
│       ├── main.tsx             # React 入口 (hash 路由)
│       ├── pages/
│       │   ├── NoteWindow.tsx    # 便签窗口
│       │   ├── ControlPanel.tsx  # 控制面板
│       │   └── SettingsPage.tsx  # 设置
│       ├── components/
│       │   ├── canvas-editor/
│       │   │   └── CanvasEditor.tsx  # 自由画布编辑器（核心）
│       │   ├── note-editor/         # 便签工具栏 + 外观面板
│       │   ├── control-panel/       # 搜索栏 + 便签列表
│       │   └── settings/            # 设置子组件
│       ├── stores/useNoteStore.ts   # Zustand 状态管理
│       └── hooks/useAutoSave.ts     # 500ms 防抖自动保存
├── resources/tray-icon.png      # 托盘图标
├── electron-builder.yml         # 打包配置
└── electron.vite.config.ts      # 构建配置
```

---

## 五、关键经验总结

1. **Native 模块慎重**: `better-sqlite3` 需要 C++ 编译工具，开发前要确认环境
2. **Canvas > 富文本编辑器**: 对于自由排版需求，自研画布比套用编辑器更灵活
3. **事件隔离要趁早**: 嵌套组件的事件冲突很难排查，独立 overlay 是最干净的方案
4. **Ref 防闭包**: React 回调中访问 state 时，`useRef` 同步最新值可以避免很多头疼的 bug
5. **国内打包要对 GitHub 降级**: 镜像下载 electron 本体，跳过签名工具，NSIS 工具还可以走代理下

---

## 六、后续可扩展方向

- [ ] 云同步（WebDAV / S3）
- [ ] Markdown 支持
- [ ] 便签分组/标签
- [ ] 暗色模式
- [ ] 手写/涂鸦
- [ ] 多语言（英语）
- [ ] macOS 版本
