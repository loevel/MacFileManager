# Contributing Guide

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd MacFileManager
   ```

2. **Install dependencies:**
   ```bash
   cd android && npm install
   cd ../electron && npm install
   ```

3. **Start development:**
   ```bash
   ./run-dev.sh
   ```

---

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow existing code style
   - Add TypeScript types (no `any`)
   - Keep components small and focused

3. **Test your changes:**
   - Build both projects: `npm run build` in each directory
   - Run type check: `npm run type-check`
   - Test in dev mode: `./run-dev.sh`

4. **Commit with clear messages:**
   ```bash
   git commit -m "Add feature: clear description of what and why"
   ```

5. **Push and create a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## Code Style

### TypeScript
- **Always** use types (no implicit `any`)
- Use `interface` for objects, `type` for unions
- Keep functions pure when possible
- Comment only the "why", not the "what"

```typescript
// ✅ Good - clear purpose
async function fetchFiles(path: string): Promise<FileEntry[]> {
  // ...
}

// ❌ Bad - implicit any, unclear
const getFiles = async (path) => {
  // ...
};
```

### React Components
- Use functional components with hooks
- One component per file
- Props interface above component
- Keep JSX simple (extract complex logic)

```typescript
// ✅ Good structure
interface Props {
  items: Item[];
  onSelect: (item: Item) => void;
}

export function ItemList({ items, onSelect }: Props) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

### CSS
- Use BEM naming convention: `block__element--modifier`
- Keep specificity low
- Use flexbox/grid over floats
- Mobile-first approach

```css
/* ✅ Good - BEM */
.file-list {
  /* ... */
}

.file-list__item {
  /* ... */
}

.file-list__item--selected {
  /* ... */
}

/* ❌ Bad - nested/specific */
.file-explorer > div > .item:nth-child(2) {
  /* ... */
}
```

---

## Project Structure

When adding features:

### API Feature
```
android/src/routes/files.ts
├── Add route handler
├── Add request validation
├── Follow response format
└── Test with curl
```

### UI Feature
```
electron/src/renderer/
├── components/MyFeature.tsx
├── styles/MyFeature.css
└── components/__tests__/MyFeature.test.tsx (optional)
```

---

## Testing

### Build Testing
```bash
# Type check
npm run type-check

# Build production
npm run build

# Both:
npm run build && npm run type-check
```

### Manual Testing
1. Start dev server: `./run-dev.sh`
2. Test in Electron app
3. Try edge cases (empty folders, large files, etc.)

---

## Common Tasks

### Adding an API Endpoint

1. **Edit** `android/src/routes/files.ts`
2. **Add** route handler:
   ```typescript
   router.post('/new-action', async (req, res) => {
     try {
       // Validate input
       // Process
       // Return response
       res.json({ status: 'success', data: result });
     } catch (err) {
       res.status(500).json({ status: 'error', error: err.message });
     }
   });
   ```
3. **Build** and test: `npm run build && npm start`

### Adding a React Component

1. **Create** `electron/src/renderer/components/MyComponent.tsx`
2. **Create** `electron/src/renderer/styles/MyComponent.css`
3. **Use** component:
   ```typescript
   import { MyComponent } from './components/MyComponent';
   
   // In JSX:
   <MyComponent prop="value" />
   ```

### Adding a New State Value

Using Zustand:
```typescript
// In store.ts
interface Store {
  myValue: string;
  setMyValue: (value: string) => void;
}

export const useStore = create<Store>(
  persist(
    (set) => ({
      myValue: '',
      setMyValue: (value: string) => set({ myValue: value }),
    }),
    { name: 'store' }
  )
);

// In component:
const { myValue, setMyValue } = useStore();
```

---

## Performance Considerations

### Before Optimizing
1. Does the feature work correctly?
2. Is the code readable?
3. Are there actual performance issues?

### When Optimizing
- Profile with browser DevTools
- Check network tab for API calls
- Use React DevTools Profiler
- Measure before/after

### Common Optimizations
- **Caching**: TanStack Query handles most cases
- **Memoization**: Only for expensive renders (`useMemo`)
- **Code splitting**: Vite handles automatically
- **Lazy loading**: Use React.lazy for route-based splitting

---

## Security Guidelines

### Input Validation
```typescript
// ✅ Validate user input
if (!path || typeof path !== 'string') {
  throw new Error('Invalid path');
}

// Check against allowed directory
if (!realPath.startsWith(BASE_ROOT)) {
  throw new Error('Access denied');
}
```

### API Security
- Always validate/sanitize inputs
- Use HTTPS in production
- Implement authentication before public deployment
- Never trust client-side validation alone

### Data Security
- Don't log sensitive data
- Clear sensitive values after use
- Validate file paths (prevent directory traversal)
- Sanitize filenames

---

## Debugging

### API Issues
```bash
# Test endpoint directly
curl http://localhost:8080/api/files?path=documents

# Check server logs (in dev mode)
# Errors logged to console

# Enable debug mode
NODE_DEBUG=express npm run dev
```

### Electron Issues
```bash
# Dev tools enabled in dev mode
# Press: Cmd+Option+I (or View → Toggle Dev Tools)

# Check main process errors
# Look at console in dev tools

# Clear cached data
# localStorage cleared on connection change
```

### Network Issues
```bash
# Verify API is running
curl http://localhost:8080/health

# Check firewall
sudo lsof -i :8080

# Trace requests (browser Network tab)
# View all requests/responses
```

---

## Documentation

### Updating README
- Keep it concise (focus on "how to use")
- Update feature list when adding major features
- Link to DEPLOYMENT.md for setup

### Adding Code Comments
Only comment the "why", not the "what":

```typescript
// ✅ Good - explains intent
// Validate path to prevent directory traversal attacks
if (!realPath.startsWith(BASE_ROOT)) {
  throw new Error('Access denied');
}

// ❌ Bad - obvious from code
// Check if realPath starts with BASE_ROOT
if (!realPath.startsWith(BASE_ROOT)) {
```

---

## Release Process

1. **Update version:**
   ```bash
   cd android && npm version patch
   cd ../electron && npm version patch
   ```

2. **Update CHANGELOG** (create if doesn't exist)

3. **Build production:**
   ```bash
   cd android && npm run build
   cd ../electron && npm run build
   ```

4. **Test thoroughly:**
   ```bash
   npm start  # API
   # Test in production mode
   ```

5. **Create git tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## Getting Help

- Check existing issues for similar problems
- Review ARCHITECTURE.md for system design
- Look at related components for patterns
- Ask in discussions or create an issue

---

## Code Review Checklist

When reviewing PRs, check:
- [ ] TypeScript types are correct (no `any`)
- [ ] No console.log, debugging code left
- [ ] Follows code style (BEM for CSS, functional for React)
- [ ] No security issues (input validation, path checks)
- [ ] Performance impact considered
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

---

## Thank You!

Contributions make this project better. Whether it's bug reports, feature requests, or code, all contributions are valued! 🎉
