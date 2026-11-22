# Concept 02: Express Routing & Middleware Pipeline
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
**Express.js** is a fast, unopinionated, minimalist web framework for Node.js that organizes server functionality around the **HTTP Request-Response Lifecycle** using an extensible **Middleware Pipeline**.

A middleware function in Express has the signature:
```javascript
function middleware(req, res, next) {
  // 1. Execute code
  // 2. Modify req or res objects
  // 3. End request-response cycle OR call next() to pass to the next handler
}
```

---

### 2. How the Middleware Pipeline Works

```
Incoming HTTP Request
       │
       ▼
┌──────────────────────────────┐
│ cors() Middleware            │ ---> Adds Access-Control-Allow-Origin headers
└──────────────┬───────────────┘
               │ next()
               ▼
┌──────────────────────────────┐
│ express.json() Middleware    │ ---> Streams request buffer, parses JSON into req.body
└──────────────┬───────────────┘
               │ next()
               ▼
┌──────────────────────────────┐
│ Route Handler (Controller)   │ ---> Validates params, invokes Service, calls res.json()
└──────────────┬───────────────┘
               │
               ▼
Outgoing HTTP Response (JSON)
```

If an error occurs or validation fails, a handler sends a response immediately (`res.status(400).json(...)`), short-circuiting the pipeline.

---

### 3. How It Is Used in Outpost

In [`server/src/server.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/server.js):

#### 1. Global Middleware Registration
```javascript
app.use(cors());          // Enables cross-origin requests from Vite frontend (Port 3000 -> 5000)
app.use(express.json());  // Automatically parses incoming JSON request payloads
```

#### 2. Parameterized Routing & URL Extraction
```javascript
// Parameterized route capturing node ID from path variable
app.post('/api/nodes/:id/harvest', async (req, res) => {
  const nodeId = parseInt(req.params.id, 10);
  const playerId = parseInt(req.body.playerId || 1, 10);
  // Service call...
});
```

#### 3. Error Trapping and Exception Handling
Every async controller wraps execution in a `try ... catch` block:
```javascript
try {
  const result = await harvestNode(playerId, nodeId, emitSocketEvent);
  if (!result.success) {
    return res.status(result.status).json(result);
  }
  res.status(result.status).json(result);
} catch (err) {
  res.status(500).json({ error: 'HARVEST_ERROR', message: err.message });
}
```

---

### 4. Common Viva Questions & Model Answers

#### Q: "What is `next()` in Express, and what happens if you forget to call it or send a response?"
> **Answer:**  
> "`next()` is a callback passed to middleware functions that passes control to the next middleware in the execution stack.  
> If a middleware neither ends the request-response cycle (e.g. by calling `res.send()` or `res.json()`) nor calls `next()`, the client request hangs indefinitely until the browser or client encounters an HTTP timeout (e.g. 504 Gateway Timeout)."

#### Q: "Why do we need `express.json()` middleware? What happens without it?"
> **Answer:**  
> "Node's native `http.IncomingMessage` arrives as a stream of raw binary chunks (`Buffer`). Without `express.json()`, `req.body` will be `undefined`. `express.json()` intercepts the incoming stream, buffers the chunks, validates that the payload is valid JSON, parses it into a JavaScript object, and attaches it to `req.body` before invoking our controllers."
