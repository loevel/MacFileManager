# Manual Testing Guide

## Setup

### Start Services
```bash
# Terminal 1 - API Server
./run-dev.sh

# Or separately:
# Terminal 1
cd android && npm run dev

# Terminal 2
cd electron && npm run dev
```

### Connect in Electron
- IP: `127.0.0.1`
- Port: `8080`
- Click "Connect"

---

## Test Cases

### 1. Connection & Navigation

**Test: Connection Setup**
- [ ] App shows connection screen on first launch
- [ ] Enter IP `127.0.0.1`, Port `8080`
- [ ] Click "Connect" → success message
- [ ] Server URL saved to localStorage (persist after restart)

**Test: Navigation**
- [ ] Click on folders → navigate into them
- [ ] Breadcrumb updates correctly
- [ ] Click breadcrumb segments → navigate back
- [ ] "Home" button returns to root (documents)
- [ ] File count updates in panel header

### 2. File Listing

**Test: File Display**
- [ ] Files show emoji icons (📁📄🖼️🎬 etc.)
- [ ] Directories listed first, then files
- [ ] File sizes format correctly (B, KB, MB, GB)
- [ ] Modified dates show
- [ ] Empty folders show "No files" message

**Test: File Selection**
- [ ] Click file → highlights blue
- [ ] Details panel shows on right
- [ ] Click different file → updates details
- [ ] Click folder → navigates (no details panel)

### 3. File Details Panel

**Test: Metadata Display**
- [ ] Selected file name shown (without emoji)
- [ ] File size formatted correctly
- [ ] MIME type shown
- [ ] Modified date shown
- [ ] Details update when selecting different file

**Test: Action Buttons**
- [ ] Download button visible for files
- [ ] Delete button visible for files
- [ ] Buttons disabled when no file selected

### 4. Upload (Drag-Drop)

**Test: Drag-and-Drop Upload**
- [ ] Hover over upload zone → "drag-over" state (blue border)
- [ ] Drop a file → uploads
- [ ] Success toast shown: "Files uploaded successfully"
- [ ] File appears in list immediately
- [ ] Upload works with multiple files

**Test: Click to Select Upload**
- [ ] Click upload zone → file picker opens
- [ ] Select file → uploads
- [ ] Works with different file types (images, docs, etc.)

**Test: Large Files**
- [ ] Upload file > 100 MB
- [ ] Upload file > 1 GB
- [ ] Should work without issues (supports up to 5GB)

### 5. Download

**Test: File Download**
- [ ] Select a file
- [ ] Click "⬇️ Download" button
- [ ] Success toast: "Download started"
- [ ] File appears in Downloads folder
- [ ] File opens correctly (matches original)

**Test: Different File Types**
- [ ] Download image → opens in image viewer
- [ ] Download PDF → opens in reader
- [ ] Download text → opens in editor
- [ ] Download binary → saves as is

### 6. Delete

**Test: Delete File**
- [ ] Select a file
- [ ] Click "🗑️ Delete" button
- [ ] Confirmation dialog appears
- [ ] Dialog shows filename
- [ ] "Cancel" closes without deleting
- [ ] "Delete" removes file
- [ ] Success toast shown
- [ ] File disappears from list
- [ ] Cannot undo (verify intentional design)

**Test: Delete Folder**
- [ ] Select a folder
- [ ] Click delete → error or folder deleted recursively
- [ ] Folder and contents removed

### 7. Notifications

**Test: Toast Messages**
- [ ] Success operations show green toast (✓)
- [ ] Errors show red toast (✕)
- [ ] Info shows blue toast (ℹ)
- [ ] Toasts appear bottom-right
- [ ] Toasts auto-dismiss after 4 seconds
- [ ] Multiple toasts stack vertically

**Test: Error Cases**
- [ ] Try invalid connection → error toast
- [ ] Upload fails → error toast with reason
- [ ] Delete fails → error toast with reason
- [ ] Network error → clear error message

### 8. Performance

**Test: Large Folders**
- [ ] Navigate to folder with 100+ files
- [ ] Scrolling is smooth (no lag)
- [ ] GPU acceleration working (will-change CSS)
- [ ] Folder with 1000+ files loads quickly

**Test: Network**
- [ ] Upload large file (1+ GB)
- [ ] Download large file (1+ GB)
- [ ] Disconnect WiFi mid-upload → error/retry
- [ ] Reconnect → connection recovers

### 9. Edge Cases

**Test: Empty Folders**
- [ ] "No files" message shown
- [ ] Upload zone still visible
- [ ] No errors

**Test: Special Characters**
- [ ] Files with spaces in name
- [ ] Files with unicode (emoji, é, ñ, etc.)
- [ ] Files with dots in middle (e.g., `my.file.txt`)

**Test: Very Long Names**
- [ ] File with 100+ character name
- [ ] Should not break UI
- [ ] Ellipsis or truncation works

**Test: Multiple Connections**
- [ ] Close and reconnect
- [ ] Breadcrumb resets to home
- [ ] File list refreshes

---

## Automated Checks

### API Endpoints
```bash
# Health
curl http://localhost:8080/health

# Directories
curl http://localhost:8080/api/directories

# Files
curl 'http://localhost:8080/api/files?path=documents'

# Upload test (will fail without file, but shows endpoint exists)
curl -X POST http://localhost:8080/api/upload

# Download test
curl -O 'http://localhost:8080/api/download?path=FILENAME'

# Delete test (be careful!)
curl -X DELETE 'http://localhost:8080/api/files?path=TESTFILE'
```

### Type Checking
```bash
cd android && npm run type-check
cd ../electron && npm run type-check
```

### Build
```bash
cd android && npm run build
cd ../electron && npm run build
```

---

## Performance Benchmarks

### Expected Performance
- Connection: < 1 second
- List 100 files: < 500ms
- Upload 10MB: < 2 seconds (depends on network)
- Download 10MB: < 2 seconds
- Large folder (1000+ files): smooth scroll (60 fps)

### Test with DevTools
1. Open Electron DevTools: `Cmd+Option+I`
2. Network tab: watch API calls
3. Performance tab: check frame rate
4. Console: look for errors

---

## Regression Testing

After making changes, verify:

**Did I break:**
- [ ] Connection/disconnection?
- [ ] File listing?
- [ ] Upload functionality?
- [ ] Download functionality?
- [ ] Delete functionality?
- [ ] Toast notifications?
- [ ] Navigation history?

**Is performance still good:**
- [ ] Scrolling smooth?
- [ ] No console errors?
- [ ] No network issues?

---

## Accessibility Testing

**Keyboard Navigation**
- [ ] Tab between elements
- [ ] Enter activates buttons
- [ ] Esc closes dialogs

**Screen Reader**
- [ ] Button labels clear
- [ ] File list items announced
- [ ] Errors communicated

**Visual Design**
- [ ] Colors have enough contrast
- [ ] Hover states visible
- [ ] Focus indicators clear

---

## Cross-Platform Testing

### macOS
- [ ] Works on Monterey (12)
- [ ] Works on Ventura (13)
- [ ] Works on Sonoma (14)

### Network
- [ ] Works on WiFi
- [ ] Works on Ethernet
- [ ] Works with VPN
- [ ] Works across subnets

---

## Stress Testing

**Test API Under Load**
```bash
# Upload multiple large files simultaneously
for i in {1..10}; do
  curl -X POST -F "file=@/path/to/file" \
    http://localhost:8080/api/upload &
done
```

**Test UI Responsiveness**
- Rapid folder navigation
- Multiple simultaneous uploads
- Rapid delete/upload cycles
- Large file operations

---

## Sign-Off Checklist

Before marking as "ready":

- [ ] All test cases passed
- [ ] No console errors
- [ ] No unhandled promises
- [ ] Network errors handled gracefully
- [ ] Performance acceptable
- [ ] Accessibility reasonable
- [ ] Cross-platform compatibility verified
- [ ] Documentation accurate
