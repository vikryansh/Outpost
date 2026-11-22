# Outpost: Production Deployment Guide (GitHub + Supabase + Render)

This guide provides step-by-step instructions for deploying **Outpost** to production using:
* **Supabase:** Managed PostgreSQL 16 cloud database with ACID transactions and advisory locks.
* **Render:** Free hosting for both the Node.js/Express WebSocket backend and the React frontend.
* **GitHub:** Source control and automated continuous deployment.

---

## Architecture Overview

```
                      +-----------------------------+
                      |         GitHub Repo         |
                      |   (vikryansh/Outpost:main)  |
                      +--------------+--------------+
                                     | (Auto-Deploy on Push)
                    +----------------+----------------+
                    |                                 |
                    v                                 v
      +---------------------------+     +---------------------------+
      |       Render Backend      |     |      Render Frontend      |
      |   (outpost-server.onrender) |    |   (outpost-client.onrender)|
      |   Node.js + Socket.io     |     |   React + Vite + Tailwind |
      +-------------+-------------+     +-------------+-------------+
                    |                                 |
                    | (DATABASE_URL connection)       | (HTTP REST + WebSockets)
                    v                                 |
      +---------------------------+                   |
      |     Supabase Database     |<------------------+
      |      (PostgreSQL 16)      |
      +---------------------------+
```

---

## Step 1: Set Up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **"New Project"**:
   * **Name:** `outpost-db`
   * **Database Password:** *(Choose a strong password and save it!)*
   * **Region:** Choose closest region (e.g. Mumbai, Singapore, or Frankfurt).
3. Click **"Create new project"** and wait ~1 minute for provisioning.

### Apply the Schema to Supabase:
1. In your Supabase Dashboard, click on the **SQL Editor** tab (left sidebar).
2. Click **"New Query"**.
3. Open [`server/src/db/schema.sql`](../server/src/db/schema.sql), copy its entire contents, paste it into the Supabase SQL editor, and click **Run**.
4. You will see: `Success. No rows returned`. All tables, CHECK constraints, exclusion constraints, and initial resource nodes are now seeded on Supabase!

### Copy your Database Connection String:
1. In Supabase, go to **Project Settings** (gear icon) $\rightarrow$ **Database**.
2. Scroll to **Connection parameters** or **Connection string**.
3. Select **URI** (or **NodeJS**):
   * Mode: **Session** (Port 5432) or **Transaction** (Port 6543)
   * The string will look like:
     `postgresql://postgres.yourprojectref:yourpassword@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require`
4. Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

---

## Step 2: Deploy to Render (Backend & Frontend)

Render makes this easy with our included `render.yaml` Blueprint:

1. Go to [render.com](https://render.com) and sign in with your GitHub account.
2. Click **"New +"** in the top-right $\rightarrow$ select **"Blueprint"**.
3. Connect your GitHub repository: **`vikryansh/Outpost`**.
4. Render will read `render.yaml` and show:
   * **`outpost-server`** (Web Service — Node.js)
   * **`outpost-client`** (Static Site — React)
5. Under **`outpost-server` Environment Variables**:
   * Add `DATABASE_URL` and paste your Supabase connection string from Step 1.
6. Under **`outpost-client` Environment Variables**:
   * Add `VITE_SERVER_URL` and enter: `https://outpost-server.onrender.com` (your backend Render URL).
7. Click **"Apply"**!

Render will automatically:
* Build the backend and launch the Socket.io server with the background Machine Ticking Engine.
* Build the React frontend with Vite and deploy it to a global CDN.

---

## Step 3: Verify the Live Deployment

1. Open your live frontend URL: `https://outpost-client.onrender.com`.
2. Check that:
   * The status indicator reads `🟢 Live Connected`.
   * Resource nodes (Ancient Grove, Iron Ridge, Copper Ridge) load from Supabase.
   * Open two tabs and click Harvest $\rightarrow$ verify real-time WebSocket sync over the internet!
