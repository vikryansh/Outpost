# Outpost: Cloud Deployment Guide (Supabase & Render)

This guide walks you through deploying **Outpost** to the cloud so that you, Hansika, your professor, and your classmates can play live multiplayer simultaneously across different laptops and mobile phones.

---

## Architecture Overview

```
+------------------------------------+        +------------------------------------+
|  SUPABASE MANAGED POSTGRESQL 16   | <====> |   RENDER WEB SERVICE (Node.js)     |
|  - Cloud relational database       |  SSL   |   - Express REST API               |
|  - ACID Concurrency & CHECK rules  |        |   - Socket.io Real-Time Server     |
|  - 5,000+ row append-only ledger   |        |   - Background Machine Ticker      |
+------------------------------------+        +------------------------------------+
                                                                 ▲
                                                                 │ WebSockets & REST
                                                                 ▼
                                              +------------------------------------+
                                              |   RENDER STATIC SITE (React + Vite)|
                                              |   - Pannable Tactical Viewport     |
                                              |   - Radar Minimap                  |
                                              |   - Real-Time Multiplayer UI       |
                                              +------------------------------------+
```

---

## Part 1: Set Up Cloud Database on Supabase (Free)

Supabase provides a free, production-grade cloud PostgreSQL database with full ACID transaction support and SSL.

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **"Sign In"** (use your GitHub account).
2. Click **"New Project"**.
3. Fill in the details:
   * **Name:** `outpost-db`
   * **Database Password:** *(Choose a strong password and save it somewhere safe!)*
   * **Region:** Choose the closest region (e.g., `South Asia (Mumbai)` or `Singapore`).
   * **Pricing Plan:** Free ($0/month).
4. Click **"Create new project"** (it takes about 1–2 minutes to provision).

### 1.2 Get Your PostgreSQL Connection String
1. In your Supabase dashboard, click **"Connect"** at the top bar (or go to **Project Settings** $\rightarrow$ **Database**).
2. Under **Connection String**, click the **URI** tab.
3. Select **"Nodejs"** or **"Session pooler"** (Port 6543 or 5432).
4. Copy the connection string. It looks like this:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
   *(Make sure to replace `[YOUR-PASSWORD]` with the actual database password you chose in Step 1.1!)*

### 1.3 Initialize Database Schema & Seed Data
1. In the Supabase left navigation bar, click **SQL Editor**.
2. Click **"New Query"**.
3. Open `Outpost/server/src/db/schema.sql` on your computer, copy the entire file contents, paste into the Supabase SQL editor, and click **"Run"**.
4. You will see: `Success. No rows returned.`
5. Go to the **Table Editor** on the left: you will now see `resource_nodes`, `players`, `inventories`, `standing_trades`, and `event_logs` with all initial nodes and players seeded!

---

## Part 2: Deploy Backend Web Service on Render (Free)

Render natively supports persistent WebSockets / Socket.io on its free tier.

### 2.1 Push Latest Code to GitHub
Ensure all your latest code is on GitHub:
```bash
cd /home/vikryansh/Workspace/projects/fsd/Outpost
git push origin main
```

### 2.2 Create the Web Service on Render
1. Go to [render.com](https://render.com) and sign in using your GitHub account.
2. Click the **"New +"** button in the top right and select **"Web Service"**.
3. Select your GitHub repository: `vikryansh/Outpost`.
4. Configure the service settings:
   * **Name:** `outpost-server`
   * **Region:** Choose the region closest to your Supabase region (e.g., `Singapore` or `Frankfurt`).
   * **Root Directory:** `server`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`

### 2.3 Add Environment Variables
Scroll down to the **Environment Variables** section and add the following:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Standard Render web port |
| `DATABASE_URL` | *(Paste your Supabase URI from Step 1.2)* | Must include your real password |

5. Click **"Deploy Web Service"**.
6. Render will install dependencies and start the server. Within 2 minutes, the logs will show:
   ```text
   [Outpost Server] 🚀 Listening on http://localhost:10000
   ```
7. Copy your public backend URL from the top of the Render dashboard:
   *(e.g., `https://outpost-server.onrender.com`)*.

---

## Part 3: Deploy Frontend Dashboard on Render (Static Site)

### 3.1 Create the Static Site
1. On your Render dashboard, click **"New +"** and select **"Static Site"**.
2. Select your repository: `vikryansh/Outpost`.
3. Configure the settings:
   * **Name:** `outpost-client`
   * **Root Directory:** `client`
   * **Build Command:** `npm install && npm run build`
   * **Publish Directory:** `dist`

### 3.2 Add the Backend Environment Variable
Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_SERVER_URL` | `https://outpost-server.onrender.com` *(Use your exact backend URL from Step 2.3 without trailing slash)* |

### 3.3 Add Single-Page App (SPA) Rewrite Rule
Under **Redirects / Rewrites**, add:
* **Source:** `/*`
* **Destination:** `/index.html`
* **Action:** `Rewrite`

4. Click **"Create Static Site"**.
5. Render will run Vite build and deploy your app. Within 1 minute, you will receive your public frontend URL:
   *(e.g., `https://outpost-client.onrender.com`)*.

---

## Part 4: How to Demonstrate Live Multiplayer

1. **Open on Device 1 (Your Laptop):**
   * Visit `https://outpost-client.onrender.com`.
   * Log in as **Vikryansh (Industrialist)**.
   * Notice the status badge: `🟢 Live v142`.

2. **Open on Device 2 (Hansika's Laptop or Your Phone):**
   * Open the exact same link `https://outpost-client.onrender.com`.
   * Log in as **Hansika (Pioneer)**.

3. **Demonstrate Concurrency to the Professor:**
   * Both of you navigate to the contested *Iron Ridge Vein #1* (with only 1 unit remaining).
   * Count down: 3... 2... 1... and click **[HARVEST]** at the exact same moment on both devices!
   * **Window 1:** Flashes green: `+1 Iron Ore added to inventory!`.
   * **Window 2:** Instantly shakes red: `⚠️ Node exhausted by another player (HTTP 409)`.
   * The live capacity bar updates dynamically across both screens via WebSockets with zero page reload.

4. **Demonstrate Deadlock-Free Trading:**
   * On Device 1: Vikryansh posts a standing offer: *2 Iron Plates for 1 Energy Crystal*.
   * On Device 2: Hansika's screen immediately receives the new offer card.
   * Hansika clicks **[ACCEPT OFFER]**: items swap atomically in Supabase with 0% deadlock risk!
