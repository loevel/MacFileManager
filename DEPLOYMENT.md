# Deployment Guide

## Quick Start

### Development (Both API + Electron)
```bash
./run-dev.sh
```
This starts both services:
- Android API: `http://localhost:8080`
- Electron: `http://localhost:5173`

### Production (API Only)
```bash
./run-prod.sh
```
This starts only the file server on port 8080.

---

## Detailed Setup

### Android API Server

**Installation:**
```bash
cd android
npm install
```

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The server will listen on `http://0.0.0.0:8080` (all interfaces).

**Environment Variables:**
```env
PORT=8080           # Server port (default: 8080)
NODE_ENV=production # Set to 'production' for optimizations
```

---

### Electron App (macOS)

**Installation:**
```bash
cd electron
npm install
```

**Development:**
```bash
npm run dev
```

**Build for Distribution:**
```bash
npm run build
```

This creates optimized bundles in `electron/dist/`.

---

## Connecting Client to Server

1. **Start API Server** (on Android device or any networked machine):
   ```bash
   ./run-prod.sh
   ```
   Note the IP address: e.g., `192.168.1.100`

2. **Start Electron App** (on Mac):
   ```bash
   cd electron
   npm run dev
   ```

3. **In Electron Connection Screen:**
   - IP: Your server IP (e.g., `192.168.1.100`)
   - Port: `8080`
   - Click "Connect"

---

## Deployment Scenarios

### Scenario 1: Local Development
- Run `./run-dev.sh` on your Mac
- Electron connects to `127.0.0.1:8080`
- Perfect for testing changes

### Scenario 2: Real Android Device
1. Run API server on Android (via Termux or similar):
   ```bash
   npm start
   ```
2. Find Android IP: Settings → Wi-Fi → Connected network
3. Run Electron on Mac, connect to that IP

### Scenario 3: Server on Remote Machine
1. Build and run API on server:
   ```bash
   npm run build
   npm start
   ```
2. Ensure port 8080 is open to your network
3. Run Electron and connect to server IP

---

## Network Security

### Development
- CORS enabled for local network only
- No authentication required (safe for private networks)

### Production Recommendations
1. **Enable HTTPS:**
   - Use a reverse proxy (nginx, caddy)
   - Or add Node.js TLS support

2. **Add Authentication:**
   - Implement API key or JWT
   - See `android/src/server.ts` for middleware examples

3. **Restrict Access:**
   - Limit CORS to specific origins
   - Use firewall rules to allow only trusted IPs

4. **Permissions:**
   - Run as non-root user
   - Use file permissions to limit access

---

## Troubleshooting

### Port 8080 already in use
```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Connection refused
1. Check server is running: `curl http://localhost:8080/health`
2. Check firewall allows port 8080
3. Verify IP address is correct (not `localhost` from another machine)

### Large file uploads failing
- Check server has `maxFileSize` set high enough
- Default is 5GB; adjust in `android/src/routes/files.ts`

### API returns 403 Access Denied
- Path validation prevents access outside `~/Documents`
- Check requested file is within allowed directory

---

## Monitoring

### Check API Health
```bash
curl http://localhost:8080/health
# Response: {"status":"ok"}
```

### Monitor API Logs
```bash
# Development (shows console output):
npm run dev

# Production (add logging):
NODE_DEBUG=express npm start
```

### File List API
```bash
curl http://localhost:8080/api/directories
curl 'http://localhost:8080/api/files?path=documents'
```

---

## Performance Tuning

### API Server
- Increase `maxFileSize` in multer config for large uploads
- Add compression middleware for gzip responses
- Enable HTTP/2 with reverse proxy

### Electron App
- Builds to ~250KB gzipped bundle
- Caching reduces API calls (TanStack Query)
- GPU scrolling for smooth file lists

---

## Building for macOS App Store

To create a `.dmg` or `.app` bundle:

```bash
cd electron
npm install --save-dev electron-builder
npx electron-builder
```

This creates distributable macOS apps in `dist/`.

---

## Version Management

Update versions in both `package.json` files before release:

```bash
# Android API
cd android
npm version patch  # or minor/major

# Electron
cd electron
npm version patch
```

---

## Support & Issues

For issues:
1. Check API is reachable: `curl http://server-ip:8080/health`
2. Check firewall and network connectivity
3. Review server logs for errors
4. Verify file paths are within allowed directories
