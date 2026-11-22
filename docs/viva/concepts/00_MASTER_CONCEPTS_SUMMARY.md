# Master Concepts Summary: FSD Course & Outpost Architecture
## Quick-Revision Viva Guide
**Course:** Full Stack Development (B.Tech CSE)  
**Authors:** Hansika Malik & Vikryansh Singh  
**Purpose:** Rapid high-yield revision covering all core curriculum concepts and how each is implemented in Outpost.

---

## ⚡ High-Yield Concept Cheatsheet

| # | Concept | What It Is (Theory) | How It Is Used in Outpost | Key Viva Takeaway |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **MVC & Layered Architecture** | Separation of concerns into Data (Model), UI (View), and Business/Routing Logic (Controller/Service). | • **Model:** PostgreSQL 16 relational tables in `schema.sql`<br>• **View:** React 18 client in `client/src/`<br>• **Controller:** Express route handlers in `server.js`<br>• **Service Layer:** Dedicated business modules (`harvestService.js`, `tradeService.js`, `machineTicker.js`). | Keeps routes thin; isolates transactional SQL and advisory locking away from HTTP transport logic. |
| **02** | **Express & Middleware** | Minimalist Node.js web framework using pipeline functions `(req, res, next)` to intercept requests. | • `cors()`: Cross-origin sharing.<br>• `express.json()`: Parses incoming JSON bodies into `req.body`.<br>• Route-level validation middleware rejecting missing fields before database execution. | Middleware forms a pipeline; error handlers catch rejected promises to trigger database `ROLLBACK`. |
| **03** | **REST Design & Status Codes** | Stateless client-server architecture using standard HTTP verbs (`GET`, `POST`) and semantic status codes. | • `200 OK`: Successful fetch/craft.<br>• `201 Created`: Trade offer or player created.<br>• `400 Bad Request`: Missing body params.<br>• `403 Forbidden`: Non-owner drill collection.<br>• `409 Conflict`: Concurrency race exhaustion.<br>• `422 Unprocessable`: Insufficient inventory. | Status codes communicate exact transactional outcomes without parsing custom JSON error strings. |
| **04** | **Auth, Roles & Tokens** | Authentication proves *who you are*; Authorization dictates *what you can do*. JWTs are signed, stateless bearer tokens. | • **Dynamic Enlistment:** Identity registration with tactical roles (*Pioneer, Industrialist, Field Engineer, Geologist*).<br>• **Resource-Level Authorization:** `machine.player_id === playerId` check returning `403 Forbidden` if a non-owner collects a drill buffer.<br>• **Token Strategy:** Tactical console allows seamless multi-agent perspective switching while strictly enforcing resource ownership at the data layer. | In automated shared-world games, authorization must sit at the relational resource layer, not just the front door. |
| **05** | **Connection Pooling (`pg.Pool`)** | Reusable cache of persistent database connections eliminating costly TCP and SSL handshakes on every request. | • Connection pool configured in `db/index.js` (`max: 20`).<br>• `pool.query()` for single reads.<br>• Dedicated `client = await getClient()` for transactions (`BEGIN ... COMMIT`) released safely in `finally { client.release(); }`. | Multi-statement transactions **must** checkout a dedicated client; calling `pool.query()` inside a transaction scrambles state across pool clients. |
| **06** | **WebSockets vs HTTP (Socket.io)** | HTTP is unidirectional half-duplex request-response. WebSockets provide persistent full-duplex bi-directional communication. | • Express handles HTTP REST actions (mutations with status codes).<br>• Socket.io distributes state changes using the **Push-After-Commit** rule.<br>• Monotonic sequence versioning (`version`) to discard out-of-order packets. | WebSockets push real-time updates to all connected tabs without client polling loops. |
| **07** | **React Hooks & Lifecycle** | Functional components utilizing `useState`, `useEffect`, and `useRef` for reactive DOM updates. | • `useState`: Local inventories, nodes, modal states.<br>• `useEffect`: Initial data loading, Socket.io event listeners, keyboard hotkeys.<br>• `useRef`: Dragging coordinates and canvas zoom references that do not trigger re-renders during 60fps pan. | `useRef` stores mutable values without causing re-renders; `useEffect` cleanup returns `socket.off()` to prevent memory leaks. |
| **08** | **CORS & Environment Variables** | CORS prevents unauthorized domain cross-talk. `.env` keeps secrets and environment-dependent URLs out of git. | • `cors({ origin: '*' })` on server.<br>• `.env`: `PORT=5000`, `DATABASE_URL=...`<br>• Vite client: `VITE_SERVER_URL` with fallback to `http://localhost:5000`. | Never commit production passwords or DB credentials to source control; load them into `process.env`. |
| **09** | **Migrations, Seeding & Constraints** | DDL scripts that define schema structure, relational invariants, and initial test datasets. | • `schema.sql`: DDL with `CHECK (remaining_units >= 0)`.<br>• `initDb.js`: Automated seeding of 8 landmark nodes.<br>• `seed-scale.js`: Volume generator seeding 6,000+ audit records for index benchmarks. | Constraints in the database represent immutable invariants that application code can never bypass. |
| **10** | **Server vs Client Validation** | Client validation enhances UX; Server validation guarantees security and data integrity. | • **Client:** Disabled buttons, loading spinners, form field restrictions.<br>• **Server:** Immediate parameter checks, atomic inventory balance validation, and PostgreSQL `CHECK` constraint enforcement. | Client validation can be bypassed with curl/Postman; only server-side validation guarantees relational safety. |

---

## 📚 Detailed Concept Documents Available:
1. [`01_MVC_AND_LAYERED_ARCHITECTURE.md`](01_MVC_AND_LAYERED_ARCHITECTURE.md)
2. [`02_EXPRESS_ROUTING_AND_MIDDLEWARE.md`](02_EXPRESS_ROUTING_AND_MIDDLEWARE.md)
3. [`03_REST_API_DESIGN_AND_HTTP_STATUS_CODES.md`](03_REST_API_DESIGN_AND_HTTP_STATUS_CODES.md)
4. [`04_AUTHENTICATION_AUTHORIZATION_AND_JWT.md`](04_AUTHENTICATION_AUTHORIZATION_AND_JWT.md)
5. [`05_DATABASE_CONNECTION_POOLING_PG_POOL.md`](05_DATABASE_CONNECTION_POOLING_PG_POOL.md)
6. [`06_WEBSOCKETS_VS_HTTP_AND_SOCKET_IO.md`](06_WEBSOCKETS_VS_HTTP_AND_SOCKET_IO.md)
7. [`07_REACT_HOOKS_STATE_AND_LIFECYCLE.md`](07_REACT_HOOKS_STATE_AND_LIFECYCLE.md)
8. [`08_CORS_ENVIRONMENT_VARS_AND_SECURITY.md`](08_CORS_ENVIRONMENT_VARS_AND_SECURITY.md)
9. [`09_DATABASE_MIGRATIONS_SEEDING_CONSTRAINTS.md`](09_DATABASE_MIGRATIONS_SEEDING_CONSTRAINTS.md)
10. [`10_SERVER_VALIDATION_VS_CLIENT_VALIDATION.md`](10_SERVER_VALIDATION_VS_CLIENT_VALIDATION.md)
