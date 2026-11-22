# Concept 06: WebSockets vs. HTTP & Socket.io Architecture
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)

| Feature | Standard HTTP / REST | WebSockets (RFC 6455) |
| :--- | :--- | :--- |
| **Protocol** | `http://` or `https://` | `ws://` or `wss://` |
| **Communication Flow** | **Unidirectional Half-Duplex:** Client asks, server responds. Server cannot push data unprompted. | **Bidirectional Full-Duplex:** Both client and server can send messages independently at any time. |
| **Connection Lifecycle** | Short-lived. Connection closes after response (or reuses keep-alive). | Long-lived persistent TCP connection established via an HTTP Upgrade handshake. |
| **Header Overhead** | ~500–1000 bytes of headers (cookies, user-agent) with *every single request*. | Frame overhead is minimal: only **2 to 10 bytes** per message. |
| **Use Case** | Resource queries, transactional mutations (`POST /api/craft`). | Live multiplayer state distribution, push notifications, ticker feeds. |

---

### 2. How WebSockets & Socket.io Work
1. **HTTP Upgrade Handshake:** The client sends a standard HTTP request with `Upgrade: websocket` and `Connection: Upgrade` headers.
2. **Protocol Switch:** The server agrees with HTTP status `101 Switching Protocols`.
3. **Persistent Full-Duplex Frame Channel:** From that moment on, raw binary/text frames travel bidirectionally over the persistent TCP stream without repeated HTTP headers.
4. **Socket.io Layer:** Wraps raw WebSockets with automatic fallback to HTTP Long-Polling (if websockets are blocked by proxy/firewalls), automatic reconnection, room management, and event-based serialization (`socket.emit(event, data)`).

---

### 3. How It Is Used in Outpost

#### 1. The Push-After-Commit Pattern
In Outpost, WebSockets are **never** used for database mutations (mutations are handled by HTTP REST to ensure transactional HTTP status codes). WebSockets are used strictly for **real-time state distribution**:
```javascript
// Inside harvestService.js
await client.query('COMMIT'); // 1. Commit transaction first!

// 2. Broadcast ONLY after successful commit
if (postCommitEmitter) {
  postCommitEmitter('NODE_STATE_UPDATED', {
    nodeId: node.id,
    remainingUnits: node.remaining_units,
    version: node.version,
    updatedAt: new Date().toISOString(),
  });
}
```

#### 2. Monotonic Stale-Packet Discard Filter in [`client/src/App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx#L83-L98)
```javascript
socket.on('NODE_STATE_UPDATED', (payload) => {
  setNodes((prevNodes) =>
    prevNodes.map((node) => {
      if (node.id === payload.nodeId) {
        // Discard stale out-of-order network packets
        if (payload.version <= node.version) {
          console.warn('[Socket Filter] Discarded stale packet:', payload);
          return node;
        }
        return { ...node, remaining_units: payload.remainingUnits, version: payload.version };
      }
      return node;
    })
  );
});
```

---

### 4. Common Viva Questions & Model Answers

#### Q: "Why didn't you just use HTTP polling (e.g. `setInterval(fetchNodes, 1000)`) instead of WebSockets?"
> **Answer:**  
> "HTTP polling creates severe network and database inefficiencies:
> 1. **Header Overhead:** With 20 connected players polling every second, the server processes 1,200 HTTP requests per minute. Each request carries ~800 bytes of redundant HTTP headers, wasting bandwidth.
> 2. **Database Load:** Polling forces PostgreSQL to execute constant, redundant `SELECT` queries even when zero mining activity occurred.
> 3. **Latency:** State updates are delayed by up to 1 full second (the polling interval).  
> WebSockets provide **event-driven push notifications**: PostgreSQL is queried only when state actually mutates, updates are received in <30ms, and frame overhead is only 2 bytes per message."

#### Q: "Why did you use HTTP POST for harvesting and crafting instead of sending everything over WebSocket messages (`socket.emit('HARVEST')`)?"
> **Answer:**  
> "This represents our **Separation of Mutation and Distribution**:
> 1. Transactional actions require precise HTTP semantics: immediate status codes (`200 OK`, `409 Conflict`, `422 Unprocessable`) and standard error bodies that allow client callers (or Postman collections) to handle failures synchronously.
> 2. WebSockets are inherently fire-and-forget; managing request-response correlation over raw sockets requires custom callback abstractions.
> 3. By using REST for mutations and Socket.io for post-commit distribution, we combine the transactional reliability of REST with the real-time speed of WebSockets."
