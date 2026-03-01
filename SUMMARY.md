# Project Summary

## Project Positioning & Constraints
- Personal LAN file/image/text drop. No auth, no permissions, no public deployment.
- Stack: Next.js (App Router), SQLite via better-sqlite3, Tailwind CSS v3 (custom dark theme), Node 20, pnpm.
- Storage: `/storage/<roomId>/<uuid.ext>` served via `/api/file/[id]`, never under `public/`. Max file size 200MB; filenames are server-generated UUIDs.
- DB schema:
  - room(id, name, created_at)
  - item(id, room_id, type text|file|image, content, file_path, file_size, created_at)
- Upload rules: size <= 200MB, server names files, delete DB record must delete disk file.

## Backend
- `lib/db.ts`: better-sqlite3 singleton, WAL, table creation.
- `lib/room.ts`: listRooms, createRoom, deleteRoom, updateRoomName.
- `lib/item.ts`: listItems, getItem, createText, createFile (UUID filename, mime->ext), deleteItem, clearRoom.
- API routes:
  - `/api/room` GET/POST
  - `/api/room/[id]` DELETE/PATCH (rename)
  - `/api/room/[id]/items` GET/DELETE (clear room)
  - `/api/item` POST (formData text/file, 200MB, content<=5000)
  - `/api/item/[id]` DELETE
  - `/api/file/[id]` GET serve stored file (inline images, attachment otherwise)

## Frontend Structure
- `app/layout.tsx`: global styles, Toaster.
- `app/page.tsx`: two-column layout (RoomsSidebar + empty/choose prompt).
- `app/room/layout.tsx`: same two-column layout.
- `app/room/page.tsx`: empty state when no rooms; prompt to pick a room when rooms exist.
- `app/room/[id]/page.tsx`: async params; provides rooms/items to RoomClient.
- `components/RoomsSidebar.tsx`: room list (delete, rename via PATCH), create room modal, mobile drawer.
- `components/CreateRoomButtonInline.tsx`: modal dialog to input room name and create room.
- `app/room/[id]/RoomClient.tsx`: main content only; header with room name + clear button; list items (text/image/file); footer composer for text/file; delete item; clear room.
- Styling: Tailwind v3 custom dark palette; shadcn components not actually used yet.

## Known Issues / TODO
- [x] Input UX: Enter 发送，Shift+Enter 换行。
- [x] 发送状态：每条消息内联发送中提示，去掉成功 toast。
- [x] Hydration 警告：统一使用固定时区的 Intl.DateTimeFormat。
- [x] 布局：桌面端为主区域添加 sidebar 同宽的左内边距，避免 footer/composer 被遮挡。
- [x] Sidebar 创建/重命名/删除：刷新只在成功后触发，创建后直接跳转新房间并关闭抽屉，成功 toast 移除。
- [x] 去掉发送/复制/删除等成功 toast，保留错误 toast。

## Recent Commits (main)
- 1b7e767 Refine sidebar, modal create, and remove duplicated sidebar in RoomClient
- 455fd7a Add room rename API and inline create fixes
- 9a6128c Add sidebar layout and fix room params handling
- c9a740d Implement BridgeNext MVP backend, UI, and Tailwind setup
