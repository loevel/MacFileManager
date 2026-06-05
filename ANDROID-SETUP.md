# Guide: Comment lancer le serveur Android

## Option 1️⃣: Serveur sur macOS (Développement)

C'est ce que nous faisons actuellement. Le serveur fonctionne sur votre Mac et simule un device Android.

### Lancer rapidement:

```bash
cd android
npm run dev
```

Résultat:
```
📱 Android File Server running on http://0.0.0.0:8080
   API endpoints available at http://localhost:8080/api
```

### Vérifier que ça fonctionne:

```bash
# Dans un autre terminal
curl http://localhost:8080/health
# Résultat: {"status":"ok"}
```

### Accès depuis l'app Electron:

1. Démarrer l'app: `cd electron && npm run dev`
2. Dans l'écran de connexion:
   - IP: `127.0.0.1`
   - Port: `8080`
   - Cliquer "Connect"

---

## Option 2️⃣: Serveur sur vrai téléphone Android (Production)

Vous pouvez lancer le serveur sur un vrai appareil Android via **Termux**.

### Étape 1: Installer Termux

1. Aller sur [F-Droid](https://f-droid.org/) ou Google Play
2. Télécharger **Termux**
3. Ouvrir Termux

### Étape 2: Installer Node.js dans Termux

```bash
# Dans Termux:
pkg update
pkg install nodejs npm
```

Vérifier:
```bash
node --version    # v18+
npm --version     # 9+
```

### Étape 3: Transférer le code Android

```bash
# Option A: Via GitHub (recommandé)
cd ~
git clone https://github.com/VOTRE-REPO/MacFileManager.git
cd MacFileManager/android

# Option B: Via ADB (si connecté à un Mac)
adb push android/ /storage/emulated/0/Download/
# Puis dans Termux: cd ~/Downloads/android
```

### Étape 4: Lancer le serveur

```bash
# Dans Termux, dossier android/
npm install      # Première fois seulement
npm run dev
```

Résultat:
```
📱 Android File Server running on http://0.0.0.0:8080
```

### Étape 5: Trouver l'IP du téléphone

```bash
# Dans Termux:
ip addr show
# Cherchez l'IP locale (ex: 192.168.1.100)
```

Ou:
```bash
# Sur votre Mac (si connecté au même WiFi):
ping votre-device.local
# Ou trouvez l'IP dans les paramètres WiFi du téléphone
```

### Étape 6: Connecter l'app Electron

1. Sur votre Mac, lancer Electron: `cd electron && npm run dev`
2. Dans l'écran de connexion:
   - IP: `192.168.1.100` (ou l'IP que vous avez trouvée)
   - Port: `8080`
   - Cliquer "Connect"

---

## Option 3️⃣: Serveur sur le Mac, accessible depuis le réseau

Lancer le serveur de façon à ce qu'il soit accessible depuis n'importe quel appareil sur votre réseau.

### Lancer le serveur:

```bash
cd android
npm run dev
```

### Trouver l'IP de votre Mac:

```bash
# Option A: Terminal
ifconfig | grep "inet " | grep -v 127.0.0.1

# Option B: Système
# Aller à Préférences Système → Réseau → WiFi → Avancé → TCP/IP
```

Vous verrez quelque chose comme: `192.168.1.50`

### Depuis Electron (sur un autre appareil):

1. IP: `192.168.1.50` (l'IP de votre Mac)
2. Port: `8080`
3. Connecter

---

## Comparaison des options

| Aspect | Option 1 (macOS) | Option 2 (Android) | Option 3 (Réseau) |
|--------|------------------|-------------------|-------------------|
| **Configuration** | ⭐ Très simple | ⭐⭐⭐ Moyen | ⭐⭐ Facile |
| **Réalisme** | Simulation | ✅ Vrai device | ✅ Vrai réseau |
| **Accès** | localhost | Réseau local | Réseau local |
| **Idéal pour** | Développement | Production | Test réseau |
| **Performance** | Excellent | Bon | Bon |

---

## Dépannage

### "Connection refused"

```bash
# Vérifier que le serveur tourne
curl http://localhost:8080/health

# Si pas de réponse, lancer:
cd android && npm run dev
```

### "Port déjà utilisé"

```bash
# Trouver le processus
lsof -i :8080

# Le tuer
kill -9 PID
```

### Problème Termux

```bash
# Mettre à jour les packages
pkg update
pkg upgrade

# Réinstaller Node.js
pkg reinstall nodejs npm
```

### Pas d'accès au WiFi dans Termux

```bash
# Vérifier les permissions
termux-setup-storage
```

Puis autoriser l'accès.

---

## Fichiers accessibles

Le serveur sert les fichiers à partir de:

```
~/Documents/       (par défaut)
~/Downloads/
~/Pictures/
```

Vous pouvez modifier `BASE_PATHS` dans `android/src/routes/files.ts`:

```typescript
const BASE_PATHS: Record<string, string> = {
  documents: path.join(process.env.HOME || '/tmp', 'Documents'),
  downloads: path.join(process.env.HOME || '/tmp', 'Downloads'),
  photos: path.join(process.env.HOME || '/tmp', 'Pictures'),
  // Ajouter d'autres dossiers:
  media: path.join(process.env.HOME || '/tmp', 'Music'),
};
```

Puis relancer le serveur.

---

## Sécurité

⚠️ **Important pour la production:**

1. **Ajouter l'authentification**:
   ```typescript
   // Dans server.ts
   app.use((req, res, next) => {
     if (req.headers.authorization !== `Bearer ${API_KEY}`) {
       return res.status(401).json({ status: 'error', error: 'Unauthorized' });
     }
     next();
   });
   ```

2. **Activer HTTPS/TLS**:
   - Utiliser un reverse proxy (nginx, caddy)
   - Ou ajouter TLS directement dans Node.js

3. **Limiter l'accès**:
   - Firewall: ouvrir seulement le port 8080
   - CORS: restreindre les origines
   - Rate limiting: limiter les requêtes par IP

---

## Variantes de lancement

### Lancer en arrière-plan (macOS)

```bash
cd android
npm start &
# ou
nohup npm start > api.log 2>&1 &
```

### Lancer avec logs (Termux)

```bash
npm run dev 2>&1 | tee api.log
```

### Lancer avec port personnalisé

```bash
PORT=9000 npm run dev
```

### Lancer en production

```bash
npm run build
npm start
```

---

## Commandes utiles

### Arrêter le serveur

```bash
# Ctrl+C dans le terminal

# Ou, s'il s'exécute en arrière-plan:
kill PID
# ou
lsof -ti:8080 | xargs kill -9
```

### Voir les logs

```bash
# Si lancé avec redirection:
tail -f api.log

# Ou regarder la console du terminal
```

### Tester les endpoints

```bash
# Health check
curl http://localhost:8080/health

# List directories
curl http://localhost:8080/api/directories

# List files
curl 'http://localhost:8080/api/files?path=documents'

# Upload test
curl -F "file=@/path/to/file" http://localhost:8080/api/upload

# Download
curl -O 'http://localhost:8080/api/download?path=filename'
```

---

## Prochaines étapes

1. ✅ Lancer le serveur (`npm run dev`)
2. ✅ Tester les endpoints (voir ci-dessus)
3. ✅ Lancer Electron (`cd electron && npm run dev`)
4. ✅ Connecter l'app au serveur
5. ✅ Tester upload/download/delete
6. 🔄 Ajouter l'authentification (pour production)
7. 🔄 Mettre en HTTPS (pour production)
8. 🔄 Déployer sur vrai device Android

---

## Résumé rapide

**Pour développement (macOS):**
```bash
./run-dev.sh    # Lance API + Electron
```

**Pour production (Android):**
```bash
# Dans Termux sur le téléphone:
npm install
npm run dev
# Puis connecter depuis Electron avec l'IP du device
```

**Pour tester sur réseau:**
```bash
# Sur Mac:
npm run dev

# Sur autre appareil:
# IP: {Mac IP}
# Port: 8080
```
