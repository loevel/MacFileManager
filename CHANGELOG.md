# Changelog

## [1.0.0] - 2026-06-04

### Added

#### Android API Server
- REST API for file management on port 8080
- GET /api/directories - List available root directories
- GET /api/files - List files in a directory with metadata
- GET /api/download - Download files (supports HTTP range requests)
- POST /api/upload - Upload files up to 5GB
- DELETE /api/files - Delete files or directories
- GET /health - Health check endpoint
- File type MIME detection and emoji icons
- Directory-first sorting of file listings
- Security: Path validation to prevent directory traversal
- CORS middleware for local network access
- Comprehensive error handling with JSON responses

#### Electron App
- Connection setup screen (IP + port configuration)
- File explorer with breadcrumb navigation
- Two-panel layout (file list + details)
- File metadata display (name, size, type, modified date)
- Drag-and-drop file upload
- File download support
- Delete file confirmation dialog
- Toast notifications (success/error/info)
- Real-time file list refresh after operations
- Persistent server URL storage (localStorage)

#### State Management
- Zustand store for global state
- TanStack Query for API caching and data fetching
- Automatic cache invalidation on mutations
- Persistent storage of user preferences

#### UI/UX
- macOS Finder-style interface
- Responsive two-panel layout
- Emoji file type indicators
- Smooth GPU-accelerated scrolling
- Loading states and error messages
- File size formatting (B, KB, MB, GB)
- Breadcrumb navigation with clickable segments
- Keyboard-friendly interface

#### Developer Experience
- TypeScript throughout (fully type-safe)
- Development scripts (run-dev.sh, run-prod.sh)
- Production builds (Vite for Electron, tsc for API)
- Type checking for both projects
- Comprehensive documentation:
  - README.md - Quick start and features
  - DEPLOYMENT.md - Setup and deployment guide
  - ARCHITECTURE.md - System design and technical details
  - CONTRIBUTING.md - Development guidelines

### Security
- Directory traversal prevention (path validation)
- Input sanitization for filenames
- Scoped file access (~/Documents directory)
- CORS configured for local network
- No hardcoded credentials or secrets
- Safe blob handling for downloads

### Performance
- Caching prevents redundant API calls
- GPU acceleration for smooth scrolling
- Efficient React rendering (no unnecessary re-renders)
- Small Electron bundle (248KB gzipped)
- will-change CSS optimization for scroll performance

### Documentation
- Quick start guide
- Feature list with checkmarks
- API endpoint documentation
- Deployment scenarios (local, Android, remote)
- Architecture diagrams
- Contributing guidelines
- Troubleshooting section

## Future Releases

### [1.1.0] - Planned
- [ ] Search functionality
- [ ] File preview (images, PDFs)
- [ ] Bulk operations (multi-select)
- [ ] Favorite/starred files
- [ ] File sorting options

### [1.2.0] - Planned
- [ ] Authentication (API key / JWT)
- [ ] HTTPS/TLS support
- [ ] Real-time file sync (WebSocket)
- [ ] Conflict resolution for sync
- [ ] File compression/extraction

### [2.0.0] - Planned
- [ ] Mobile app (React Native)
- [ ] Web version (Next.js)
- [ ] Database backend (replace file system)
- [ ] Cloud storage integration
- [ ] Collaborative editing

## Known Limitations

- No authentication (assumes trusted local network)
- HTTP only (no TLS/HTTPS by default)
- Single-threaded API (may be slow with many concurrent requests)
- File previews not supported
- No real-time sync between clients
- Electron app macOS only (currently)

## Version Info

- Node.js: 20+
- npm: 10+
- Electron: 31+
- React: 19
- TypeScript: 5.1+

## Credits

Built as a complete file management solution for Android device access via local network.

- Architecture: Client-server REST API
- Frontend: React + Electron
- Backend: Node.js + Express
- Styling: Plain CSS with flexbox/grid
- State: Zustand + TanStack Query
