# AndroidExplorer — Mac File Manager

A macOS Electron app to explore, navigate, download, upload, and delete files on an Android device connected via local network.

## Architecture

- **`android/`** — Lightweight Node.js/Express HTTP API server (runs on Android port 8080)
- **`electron/`** — Electron + React application for macOS (runs on Mac)

## Quick Start

### Phase 1: Android API Server

```bash
cd android
npm install
npm run dev
```

The server will start on `http://0.0.0.0:8080`.

#### Available Endpoints

- `GET /api/directories` — List available directories
- `GET /api/files?path=relative/path` — List files in a directory
- `GET /api/download?path=relative/path` — Download a file (supports range requests)
- `DELETE /api/files?path=relative/path` — Delete a file or directory

#### Response Format

All endpoints return JSON:

```json
{
  "status": "success|error",
  "data": {},
  "error": "error message if status='error'"
}
```

### Phase 2: Electron App

```bash
cd electron
npm install
npm run dev
```

## Development Flow

**Phase 1** ✅ API Android basique  
**Phase 2** UI Electron minimale  
**Phase 3** Upload et suppression  
**Phase 4** Virtualisation et optimisations  
**Phase 5** Raffinements (icônes, erreurs, reconnexion)

## Security Notes

- File access is sandboxed to `~/Documents` directory on dev machine
- All paths are validated against directory traversal attacks
- CORS is enabled for local network requests
- In production, implement authentication and TLS

## Stack

- **Android API**: Node.js, Express, TypeScript
- **Mac App**: Electron, React, TypeScript, Vite
- **Virtualisation**: react-window for large file lists
- **State**: Zustand for global state management
- **Data Fetching**: TanStack Query for caching

## License

MIT
