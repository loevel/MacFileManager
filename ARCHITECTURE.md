# Architecture Documentation

## System Overview

```
Android Device / Server                    macOS Client
┌─────────────────────────────┐          ┌──────────────────────┐
│   Android File Server       │          │   Electron App       │
│   ┌─────────────────────┐   │          │ ┌────────────────┐   │
│   │  HTTP REST API      │   │◄─────────┤►│  React UI      │   │
│   │  (Node.js/Express)  │   │   HTTP   │ ├────────────────┤   │
│   │                     │   │          │ │ - Breadcrumbs  │   │
│   │  GET  /api/files    │   │          │ │ - File List    │   │
│   │  GET  /api/download │   │          │ │ - Upload Zone  │   │
│   │  POST /api/upload   │   │          │ │ - Details      │   │
│   │  DEL  /api/files    │   │          │ └────────────────┘   │
│   └─────────────────────┘   │          │ Zustand Store       │
│                             │          │ TanStack Query      │
│   File System               │          │ (Caching)           │
│   ~/Documents               │          └──────────────────────┘
│   ~/Downloads               │
│   ~/Pictures                │
└─────────────────────────────┘
```

---

## API Architecture

### Request/Response Pattern

All endpoints follow a consistent JSON response format:

```typescript
{
  status: "success" | "error",
  data?: T,
  error?: string
}
```

### Endpoints

| Method | Path | Purpose | Permissions |
|--------|------|---------|-------------|
| GET | `/health` | Health check | Public |
| GET | `/api/directories` | List available directories | Public |
| GET | `/api/files` | List files in directory | Scoped to ~/Documents |
| GET | `/api/download` | Download file | Scoped to ~/Documents |
| POST | `/api/upload` | Upload file | Scoped to ~/Documents |
| DELETE | `/api/files` | Delete file/folder | Scoped to ~/Documents |

### Security Model

**Path Validation:**
```typescript
// All paths resolved to absolute, then checked against base
const realPath = await fs.realpath(requestedPath);
const docRoot = await fs.realpath(BASE_PATHS.documents);

if (!realPath.startsWith(docRoot)) {
  return 403; // Access Denied
}
```

**No authentication required** for local network (assumes trusted network).

---

## Frontend Architecture

### Component Hierarchy

```
App
├── ConnectionSetup
│   └── (IP/Port entry)
├── FileExplorer
│   ├── Header
│   ├── Breadcrumb
│   │   └── clickable path segments
│   ├── FilePanel
│   │   ├── UploadDropZone
│   │   └── FileList
│   ├── DetailPanel
│   │   └── File metadata + actions
│   ├── ConfirmDialog
│   │   └── delete confirmation
│   └── ToastContainer
│       └── success/error notifications
└── Global
    └── Zustand store (serverUrl, currentPath)
```

### State Management

**Global State (Zustand):**
```typescript
// Persisted to localStorage
{
  serverUrl: string | null,      // e.g., "http://127.0.0.1:8080"
  currentPath: string,            // e.g., "documents/Downloads"
  setServerUrl: (url: string) => void,
  setCurrentPath: (path: string) => void,
}
```

**Local Component State:**
- `selectedFile`: FileEntry | null
- `isUploading`: boolean
- `deleteTarget`: FileEntry | null
- `toasts`: ToastMessage[]

**Server State (TanStack Query):**
- `files` - cached file list (invalidated after upload/delete)
- Automatic refetching on stale/focus
- 5-minute cache default

### Data Flow

1. **Browse**: User clicks folder → `setCurrentPath()` → Query fetches files → FileList renders
2. **Upload**: Drag files → Form submission → POST to `/api/upload` → Invalidate cache → Auto-refresh
3. **Download**: Click button → GET `/api/download` → Browser save dialog
4. **Delete**: Click delete → ConfirmDialog → DELETE request → Invalidate cache → Auto-refresh

---

## Performance Optimizations

### Caching Strategy

**TanStack Query** provides:
- Automatic deduplication of parallel requests
- Stale-while-revalidate pattern
- Automatic invalidation after mutations
- Background refetch on window focus

Configuration:
```typescript
staleTime: 1000 * 60 * 5,      // 5 minutes before stale
gcTime: 1000 * 60 * 10,        // 10 minutes before garbage collection
```

### Rendering Optimization

**FileList:**
- Plain CSS (no framework overhead)
- `will-change: transform` for GPU acceleration
- Flex layout for responsive sizing
- No unnecessary re-renders (memoization at component level)

**Virtualisation (Future):**
- For 1000+ files: implement react-window FixedSizeList
- Server-side pagination (limit/offset)
- Incremental loading with IntersectionObserver

### Network Optimization

**Range Requests:**
- Server supports `Range` header
- Large files downloaded in chunks
- Client-side resume capability (future)

**File Uploads:**
- Multer memory storage (fast for typical files)
- File size limit: 5GB (configurable)
- No chunking yet (chunked upload in future for >5GB)

---

## Technology Decisions

### Why Node.js/Express for API?
- ✅ JavaScript/TypeScript consistency
- ✅ Built-in JSON handling
- ✅ Fast HTTP server
- ✅ Rich ecosystem (multer, cors, etc.)
- ✅ Easy deployment

### Why React for UI?
- ✅ Component reusability
- ✅ Virtual DOM for efficiency
- ✅ Excellent tooling
- ✅ Strong ecosystem

### Why Electron for Desktop?
- ✅ Single codebase (JavaScript)
- ✅ No installation required (just download)
- ✅ Full system access (file downloads, etc.)
- ✅ Easy to ship updates

### Why Zustand over Redux?
- ✅ Minimal boilerplate
- ✅ TypeScript-friendly
- ✅ Smaller bundle size
- ✅ Simpler to learn

### Why TanStack Query over SWR?
- ✅ Advanced cache invalidation
- ✅ Better for mutations
- ✅ Excellent dev tools
- ✅ More control over fetch behavior

---

## File Organization

### Android API
```
android/
├── src/
│   ├── index.ts              # Server entry point
│   ├── server.ts             # Express app factory
│   └── routes/
│       └── files.ts          # All file endpoints
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

### Electron App
```
electron/
├── src/
│   ├── main/
│   │   └── index.ts          # Main process
│   └── renderer/
│       ├── main.tsx          # Entry point
│       ├── App.tsx           # Root component
│       ├── store.ts          # Zustand store
│       ├── components/
│       │   ├── FileExplorer.tsx
│       │   ├── FileList.tsx
│       │   ├── Breadcrumb.tsx
│       │   ├── UploadDropZone.tsx
│       │   ├── ConfirmDialog.tsx
│       │   ├── ConnectionSetup.tsx
│       │   └── Toast.tsx
│       ├── styles/
│       │   ├── App.css
│       │   └── *.css         # Component styles
│       └── App.css
├── dist/                     # Production build output
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Error Handling

### API Errors
```typescript
try {
  // API operation
} catch (err) {
  res.status(500).json({
    status: 'error',
    error: err.message
  });
}
```

### Client Errors
```typescript
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error('API Error');
} catch (err) {
  addToast(`Operation failed: ${err.message}`, 'error');
}
```

---

## Extension Points

### Adding New Endpoints

1. Create route handler in `android/src/routes/files.ts`
2. Follow request/response pattern
3. Add path validation for file access
4. Document in README

### Adding New Features

1. Create component in `electron/src/renderer/components/`
2. Use Zustand for global state
3. Use TanStack Query for API calls
4. Add corresponding styles in `styles/`

### Customizing UI

- Styles are plain CSS (no CSS-in-JS)
- Color scheme in CSS variables (easy to theme)
- Emoji icons easily replaceable

---

## Future Improvements

### Near Term
- [ ] Server-side pagination (limit/offset)
- [ ] Search functionality
- [ ] File preview (images, PDFs)
- [ ] Bulk operations (multi-select, delete)

### Medium Term
- [ ] Authentication (API key / JWT)
- [ ] HTTPS/TLS support
- [ ] Real-time file sync (WebSocket)
- [ ] Conflict resolution for sync

### Long Term
- [ ] Mobile app (React Native)
- [ ] Web version (Next.js)
- [ ] Database backend (replace file system)
- [ ] Cloud storage integration
