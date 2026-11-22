# Concept 04: Authentication, Authorization & Security Strategy
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
* **Authentication (AuthN):** The process of verifying **who a user is** (e.g. username/password, biometric identity, or digital certificate).
* **Authorization (AuthZ):** The process of verifying **what an authenticated user is permitted to do** (e.g. role-based access control, resource ownership permissions).

#### JSON Web Tokens (JWT) Architecture:
A JWT is a compact, URL-safe, digitally signed string composed of three base64-encoded segments separated by periods (`.`):
$$\text{JWT} = \underbrace{\text{Header}}_{\text{Algorithm \& Token Type}} \;.\; \underbrace{\text{Payload}}_{\text{Claims, User ID, Role, Expiry}} \;.\; \underbrace{\text{Signature}}_{\text{HMACSHA256(Header + Payload, Secret)}}$$

* **Statelessness:** The server does not store active session records in memory or a database. When a client presents a Bearer Token in the `Authorization` header (`Bearer <token>`), the server verifies the signature using its private secret key and extracts the claims directly from the payload.

---

### 2. How Security and Permissions Work in Outpost

#### 1. Tactical Command Profile Enlistment
In Outpost, players represent sector pioneers cooperating and competing in a persistent industrial world.
* New players are enlisted via `POST /api/players` with a unique callsign and tactical role:
  * **Pioneer:** Frontier extraction and scavenging.
  * **Industrialist:** Resource smelting and component fabrication.
  * **Field Engineer:** Machine deployment and MK-1 automated drill logistics.
  * **Geologist:** Rare crystal survey and cavern exploration.
* Callsign uniqueness is verified inside an atomic transaction; duplicate callsigns trigger `409 Conflict`.

#### 2. Resource-Level Authorization (Ownership Guards)
In multiplayer automation games, the critical security vulnerability is **resource hijacking**—an unauthorized player stealing ores from an automated drill deployed by another pioneer.
In [`server/src/services/machineTicker.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/machineTicker.js#L135-L138):
```javascript
// Strict Resource Ownership Verification
if (machine.player_id !== playerId) {
  return {
    success: false,
    status: 403,
    error: 'FORBIDDEN',
    message: 'Security Access Refused: You do not own this machine.',
  };
}
```
If Player #2 attempts to collect buffer units from a drill owned by Player #1, the server halts execution and returns HTTP `403 Forbidden`.

---

### 3. Viva Defense Strategy: Why Callsigns Over Passwords in Outpost

#### Q: "Why didn't you put a password login page with JWT tokens on the front of Outpost?"
> **Answer:**  
> "We intentionally designed Outpost as an industrial tactical console rather than a single-user private web application.  
> 1. **Viva & Multi-Client Demonstration:** An examiner needs to open two browser tabs side-by-side and quickly switch between Pioneer perspectives (*Vikryansh* and *Hansika*) to demonstrate real-time concurrency and race conditions. Forcing cookie session logins would lock the browser tab to a single cookie, preventing concurrent multiplayer demonstrations on one machine without private incognito tabs.
> 2. **Where the Real Security Sits:** The dangerous attack vector in full-stack applications is not whether the front door has a password, but whether **resource endpoints enforce authorization at the database layer**. Even with JWT, naive apps fail because an authenticated user can simply pass another user's ID into the URL and steal their resources (Insecure Direct Object Reference - IDOR).
> 3. Outpost implements strict **Resource-Level Authorization**: non-owners are blocked with `403 Forbidden` from collecting machine buffers or cancelling trades, and transactions validate identity prior to inventory mutations."

#### Q: "How would you convert Outpost to use JWT tokens if requested?"
> **Answer:**  
> "We would introduce a `users` table with `password_hash` hashed using `bcrypt` (salt rounds = 10). Upon `POST /api/auth/login`, Express signs a token:
> ```javascript
> const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
> ```
> We would add an authentication middleware `authenticateToken(req, res, next)` to our Express pipeline that reads `req.headers['authorization']`, verifies it via `jwt.verify()`, and attaches `req.user` to the request object. Controllers would then use `req.user.id` instead of reading `req.body.playerId`."
