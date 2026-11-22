# Concept 08: CORS, Environment Variables & Security Isolation
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)

#### 1. CORS (Cross-Origin Resource Sharing):
The browser enforces the **Same-Origin Policy (SOP)**: a web application executing on `Origin A` (`http://localhost:3000`) is prohibited from fetching data from `Origin B` (`http://localhost:5000`) unless Origin B explicitly returns HTTP headers consenting to the request.
* Origin is defined by three tuples: **Protocol + Host + Port** (`http` + `localhost` + `3000`).
* When an app executes a non-simple request (such as a `POST` with `Content-Type: application/json`), the browser first dispatches an HTTP **`OPTIONS` preflight request**. The server must respond with `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods`.

#### 2. Environment Variables & Process Isolation:
Keeping secrets, database credentials, and host configurations out of the source code repository:
* Backend uses `process.env` loaded via the `dotenv` package from `.env`.
* Frontend (Vite) uses `import.meta.env` (prefixed with `VITE_`).

---

### 2. How It Is Used in Outpost

#### 1. CORS Configuration in Express & Socket.io
In [`server/src/server.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/server.js#L23-L31):
```javascript
const io = new Server(server, {
  cors: {
    origin: '*',          // Allows browser clients from any host (e.g. localhost:3000)
    methods: ['GET', 'POST'],
  },
});

app.use(cors());          // Enables CORS middleware for Express HTTP REST routes
```

#### 2. Environment Configuration
* **Backend:** [`.env`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/.env):
  ```env
  PORT=5000
  DATABASE_URL=postgres://outpost_user:outpost_password@localhost:5433/outpost_db
  NODE_ENV=development
  ```
* **Frontend:** [`client/src/services/api.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/services/api.js#L1):
  ```javascript
  // Uses Vite environment variable in production, falls back to localhost:5000 in dev
  const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  ```

---

### 3. Common Viva Questions & Model Answers

#### Q: "What is a CORS preflight request (`OPTIONS`), and why does it happen?"
> **Answer:**  
> "A preflight request is an HTTP `OPTIONS` request sent automatically by the browser before the actual request is dispatched. It checks with the server whether the cross-origin request is safe to send.  
> It is triggered whenever a request uses methods other than simple `GET` or `HEAD`, or includes custom headers (such as `Authorization` or `Content-Type: application/json`). The server must respond with `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods: GET, POST` to allow the browser to send the actual payload."

#### Q: "Why should you never commit a `.env` file to GitHub?"
> **Answer:**  
> "`.env` files contain sensitive operational secrets: production database passwords, JWT private encryption keys, API tokens, and cloud connection strings.  
> If pushed to a public or private repository, these secrets can be indexed by automated bots or leaked, leading to catastrophic database compromise. Best practice is to add `.env` to `.gitignore` and commit only a sanitized `.env.example` file showing required variable keys with dummy values."
