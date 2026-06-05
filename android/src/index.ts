import { createApp } from './server.js';

const PORT = process.env.PORT || 8080;

const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`📱 Android File Server running on http://0.0.0.0:${PORT}`);
  console.log(`   API endpoints available at http://localhost:${PORT}/api`);
});
