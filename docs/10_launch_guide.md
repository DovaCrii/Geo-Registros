# Launch Guide — Geo-Registros

> How to run the app locally on Windows using Docker Desktop + WSL2.

## Prerequisites

- Windows 10 (22H2+) or Windows 11
- WSL2 installed with a default distro (Ubuntu recommended)
- **At least 8 GB RAM** (Docker Desktop + PostgreSQL use ~2-3 GB)

## Step 1 — Install Docker Desktop

1. Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Click **Download for Windows** (the installer is ~600 MB)
3. Run `Docker Desktop Installer.exe`
4. When asked, **check "Use WSL 2 instead of Hyper-V"** (critical)
5. Leave "Add shortcut to desktop" checked
6. Click **OK** and let it install

> **Permissions**: The installer will ask for Administrator privileges — accept it. Docker Desktop needs admin rights to install the WSL2 kernel update and configure networking.

7. When done, **restart your computer** when prompted.

## Step 2 — First launch of Docker Desktop

1. After restart, Docker Desktop should start automatically (look for the whale icon in the system tray)
2. Accept the **Docker Subscription Service Agreement** when it appears
3. If a WSL2 kernel update dialog appears: click **Update & Restart**
4. Wait until the green "Engine running" message appears at the bottom-left
5. Open a **PowerShell** terminal and verify:
   ```powershell
   docker --version
   ```
   Expected output: `Docker version 28.x.x, build xxxxx`

## Step 3 — Open the project in VS Code

You have two ways to work with the project:

### Option A: Native Windows path (recommended for you)

The project is at `D:\OneDrive - J.E.J. Ingeniería S.A\I+D\geo-registros`.

Open VS Code and:
```
File → Open Folder → D:\OneDrive - J.E.J. Ingeniería S.A\I+D\geo-registros
```

Docker Desktop handles the cross-talk between Windows paths and WSL2 automatically when you use `docker compose`.

### Option B: Inside WSL2

```bash
cd ~
git clone <repo-url> geo-registros
code geo-registros
```

Both work. Option A is simpler if you're not comfortable with WSL2 terminals.

## Step 4 — Environment setup

1. In VS Code, open the file `.env.example` at the project root
2. Save a copy as `.env` (same folder)
3. The default values should work as-is:
   ```env
   DATABASE_URL="postgresql://geo_registros:geo_registros@localhost:5432/geo_registros"
   NEXT_PUBLIC_APP_NAME="Geo-Registros"
   STORAGE_ROOT="./storage/documents"
   ```

> Note: The `.env.example` file already contains the correct credentials matching the `docker-compose.yml`. You should not need to change anything unless you customized passwords.

## Step 5 — Install Node dependencies

Open a **PowerShell** terminal in VS Code (Terminal → New Terminal) and run:

```powershell
npm install
```

This installs Next.js, Prisma, MapLibre, Terra Draw, and all other dependencies listed in `package.json`.

## Step 6 — Launch the database

Make sure Docker Desktop is running (system tray whale icon is steady, not animated).

In the same PowerShell terminal:

```powershell
docker compose up -d
```

This starts a PostgreSQL 16 + PostGIS container in the background.

Verify it's running:

```powershell
docker ps
```

You should see a container named `geo-registros-db` with status `Up`.

## Step 7 — Database setup (migrations)

Once the database is running, wait ~5 seconds for it to be ready, then:

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

This creates the tables defined in `prisma/schema.prisma`.

> **If you see "Can't reach database server"**: The DB needs a few more seconds to start. Run `npx prisma migrate dev --name init` again.

## Step 8 — Build and run the app

```powershell
npm run build
npm run dev
```

Wait for the output:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

## Step 9 — Open in browser

Open Chrome/Edge and go to: [http://localhost:3000](http://localhost:3000)

## Step 10 — Shutting down

When you're done:

- **Stop the app**: Press `Ctrl+C` in the terminal where `npm run dev` is running
- **Stop the database**:
  ```powershell
  docker compose down
  ```
- **Close Docker Desktop**: Right-click the whale icon → Quit Docker Desktop

---

## Common problems

| Symptom | Fix |
|---------|-----|
| `docker` command not found | Docker Desktop isn't running. Start it from Start Menu and wait for "Engine running". |
| Port 5432 already in use | You have another PostgreSQL running. Stop it or change the port in `docker-compose.yml` to `5433:5432`. |
| `prisma migrate` stuck | Wait 10 seconds after `docker compose up -d` — PostgreSQL needs time to initialize. |
| `npm run build` fails with type errors | Run `npx prisma generate` first, then `npm run build`. |
| Map shows blank tiles | The demo tileserver at `demotiles.maplibre.org` requires internet access. Offline tiles are not configured yet. |
| WSL2 memory too high | Open `%USERPROFILE%\.wslconfig` and add:\n```\n[wsl2]\nmemory=4GB\n```\nThen run `wsl --shutdown` in PowerShell and restart Docker Desktop. |

## Quick-reference (once everything works)

```powershell
# Day-to-day: start the app
docker compose up -d               # Start database
npm run dev                         # Start dev server (http://localhost:3000)

# Day-to-day: stop
Ctrl+C                              # Stop dev server
docker compose down                 # Stop database

# After pulling changes
npm install                         # Update dependencies
npx prisma generate                 # Regenerate Prisma client
npx prisma migrate dev              # Apply new migrations
npm run build                       # Verify the build
```

> **Tip**: Bookmark this doc. The quick-reference at the end is all you'll need day-to-day.
