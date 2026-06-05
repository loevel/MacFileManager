# AndroidExplorer — Mac File Manager

A macOS Electron app to explore, navigate, download, upload, and delete files on an Android device connected via local network.

## Architecture

- **`android/`** — Lightweight Node.js/Express HTTP API server (runs on Android port 8080)
- **`electron/`** — Electron + React application for macOS (runs on Mac)

## Development Setup

### Step 1: Start Android API Server

```bash
cd android
npm install        # install once
npm run dev        # starts on http://localhost:8080
```

The server will be available at `http://0.0.0.0:8080` and accepts connections from any device on the network.

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/directories` | List available directories |
| GET | `/api/files?path=relative/path` | List files in a directory with metadata |
| GET | `/api/download?path=relative/path` | Download file (supports HTTP range requests) |
| DELETE | `/api/files?path=relative/path` | Delete file or directory recursively |

All responses follow this format:
```json
{
  "status": "success|error",
  "data": {},
  "error": "error message (if status='error')"
}
```

### Step 2: Start Electron App

In a new terminal:

```bash
cd electron
npm install        # install once
npm run dev        # starts dev server on http://localhost:5173
```

This will:
- Start Vite dev server on port 5173
- Launch Electron with dev tools open
- Enable hot reload for React changes

### Testing the Connection

1. **Start Android API** on `localhost:8080`
2. **Start Electron app**
3. On the connection screen, enter:
   - IP: `127.0.0.1` (or your Android IP for real device)
   - Port: `8080`
4. Click "Connect" to test the health check
5. Browse files from your `~/Documents` folder

## Development Flow

**Phase 1** ✅ Android API server with file listing, download, delete  
**Phase 2** ✅ Electron UI with navigation and file browsing  
**Phase 3** 🔲 Upload and deletion (POST /upload, confirm DELETE)  
**Phase 4** 🔲 Virtualisation for 1000+ file lists  
**Phase 5** 🔲 Refinements (better icons, error handling, reconnection logic)

## Security

- **File access**: Sandboxed to `~/Documents` in development
- **Path validation**: All paths checked against directory traversal attacks
- **CORS**: Enabled for local network requests only
- **Production**: Will need authentication, TLS, and scoped storage

## Tech Stack

### Android API
- Node.js + Express
- TypeScript
- CORS middleware
- Range request support for large files

### Electron App
- React 19
- Electron 31
- TypeScript
- Vite (dev server and build)
- Zustand (global state)
- TanStack Query (data fetching + caching)
- CSS (Finder-style design)

### Features
- Two-panel layout (files + details)
- Breadcrumb navigation
- File metadata display (size, type, modified date)
- Directory-first sorting
- Persistent server URL storage

## Project Structure

```
MacFileManager/
├── android/
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── server.ts         # Express app setup
│   │   └── routes/
│   │       └── files.ts      # API endpoints
│   └── package.json
├── electron/
│   ├── src/
│   │   ├── main/
│   │   │   └── index.ts      # Electron main process
│   │   └── renderer/
│   │       ├── main.tsx      # React entry point
│   │       ├── App.tsx       # Root component
│   │       ├── store.ts      # Zustand state
│   │       ├── components/   # React components
│   │       └── styles/       # CSS files
│   ├── index.html
│   └── package.json
└── README.md
```

## Next Steps

1. **Phase 3**: Implement upload (POST /api/upload with multipart)
2. **Phase 3**: Implement deletion confirmation dialog
3. **Phase 4**: Add react-window virtualisation for large file lists
4. **Phase 5**: Better error handling and reconnection logic

## License

MIT
