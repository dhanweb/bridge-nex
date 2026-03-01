# BridgeNext

个人局域网文件 / 图片 / 文本中转站，适合电脑与手机在同一局域网内快速互传。无用户体系、无认证，强调轻量与长期自用。

## 特性
- 多房间分组：快速创建/重命名/删除房间，便于分类。
- 文本、图片、文件上传与查看：服务器端生成文件名，最大 200MB，存储于 `/storage/<roomId>/<uuid.ext>`，通过 `/api/file/[id]` 访问。
- 输入体验：Enter 发送，Shift+Enter 换行；发送中禁用输入；每条消息内联“发送中”状态。
- 清空/删除：房间内容或单条内容删除后立即更新列表。
- 复制与下载：文本一键复制，文件/图片可下载。
- 邀请二维码：生成当前房间链接的二维码，便于手机扫码加入同一房间。
- 移动端侧边栏：展开后点击主区域可收起。

## 技术栈
- Next.js App Router
- React 19
- Tailwind CSS
- better-sqlite3 + SQLite（WAL，单文件）
- pnpm（Node 20）

## 本地开发
1. 安装依赖
   ```bash
   pnpm install
   ```
2. 开发启动
   ```bash
   pnpm dev
   ```
   默认监听 3000 端口。局域网访问建议运行 `next start -H 0.0.0.0`。
3. 构建与生产启动
   ```bash
   pnpm build
   pnpm start
   ```
4. 代码检查
   ```bash
   pnpm lint
   ```

## 目录概览
- `app/room/[id]/RoomClient.tsx`：房间主界面（列表、发送、删除、二维码、清空）。
- `components/RoomsSidebar.tsx`：房间列表、重命名、删除、创建（移动端抽屉）。
- `components/CreateRoomButtonInline.tsx`：创建房间弹框（全屏居中）。
- `lib/room.ts` / `lib/item.ts`：房间与内容的数据库操作。
- `app/api/*`：房间、内容、文件相关 API。

## 上传与存储规则
- 服务器生成文件名；不暴露原始文件名到 public。
- 路径：`/storage/<roomId>/<uuid.ext>`；访问统一走 `/api/file/[id]`。
- 单文件大小限制：200MB。
- 删除记录时同步删除磁盘文件。

## 使用提示
- 文本输入：Enter 发送，Shift+Enter 换行；发送中按钮与输入禁用。
- 复制：文本卡片右上角“复制/已复制”。
- 邀请二维码：房间头部“邀请二维码”按钮，弹框可扫码或复制链接。
- 移动端：点主区域可收起侧边栏。

## 运行要求
- Node.js 20
- pnpm

## 许可证
本项目为个人自用示例，未声明许可证。请在私有/本地环境使用。
