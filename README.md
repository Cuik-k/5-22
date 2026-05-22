# NoteMm

Windows 桌面便签工具，自由画布式排版。

## 功能

- **自由画布** — 点击任意位置创建文字块，拖拽移动位置
- **富文本编辑** — 加粗、斜体、下划线、字体、字号、文字颜色、下划线颜色
- **清单** — 右键画布创建清单项，勾选自动划掉
- **拖入图片** — 从桌面拖图片进便签，自由缩放移动
- **外观自定义** — 便签背景色、透明度、圆角、阴影可调
- **便签置顶** — 独立置顶，可折叠展开
- **控制面板** — 搜索、拖拽排序、批量管理
- **系统托盘** — 后台常驻，全局快捷键唤出
- **自动保存** — 500ms 防抖自动存，启动恢复

## 安装

从 [Releases](https://github.com/Cuik-k/5-22/releases) 下载最新 `NoteMm Setup x.x.x.exe`，双击安装。

## 开发

```bash
git clone https://github.com/Cuik-k/5-22.git
cd 5-22
npm install
npm run dev
```

## 技术栈

- Electron + React + TypeScript
- SQLite（better-sqlite3）
- Tailwind CSS
- electron-vite

## License

MIT
