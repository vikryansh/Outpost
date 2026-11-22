# Concept 05: Database Connection Pooling (`pg.Pool`)
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
Establishing a new physical connection to a PostgreSQL database is an expensive operating-system and network operation:
1. TCP 3-way handshake (`SYN`, `SYN-ACK`, `ACK`).
2. SSL/TLS cryptographic handshake.
3. PostgreSQL server process fork / backend worker initialization (`postgres: user db`).
4. Authentication credentials exchange and memory allocation (`work_mem`).

A **Database Connection Pool (`pg.Pool`)** maintains a cache of pre-established, persistent physical database connections. When an application thread requires database access:
* It borrows an idle connection from the pool.
* It executes its SQL statement or transaction block.
* It returns the connection back to the pool for reuse, avoiding repeated connection creation overhead.

---

### 2. The Golden Rule of Transactions with Connection Pools

$$\textbf{CRITICAL ARCHITECTURAL DISTINCTION}$$

| Approach | Code | Safe for Multi-Statement Transactions (`BEGIN/COMMIT`)? |
| :--- | :--- | :---: |
| **Pool Shorthand Query** | `pool.query('BEGIN; ...')` | ❌ **FATAL BUG:** Each call to `pool.query()` borrows an arbitrary connection from the pool and immediately returns it. The `BEGIN` statement runs on Client A, the `UPDATE` runs on Client B, and the `COMMIT` runs on Client C! |
| **Dedicated Client Checkout** | `const client = await pool.connect();`<br>`await client.query('BEGIN');`<br>`...`<br>`await client.query('COMMIT');`<br>`client.release();` | ✅ **CORRECT:** The transaction executes on the **exact same physical connection** from `BEGIN` to `COMMIT`. |

---

### 3. How It Is Used in Outpost

#### 1. Pool Configuration in [`server/src/db/index.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/index.js)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                   // Maximum 20 simultaneous connections
  idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout after 2s if pool is saturated
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
```

#### 2. Transaction Demarcation in [`harvestService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/harvestService.js)
```javascript
// Checkout dedicated connection for the transaction
const client = await getClient();

try {
  await client.query('BEGIN');
  // Atomic decrement...
  // Inventory upsert...
  // Audit log insert...
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  // CRITICAL: Always release the client back to the pool!
  client.release();
}
```

---

### 4. Common Viva Questions & Model Answers

#### Q: "What is connection pool exhaustion (or a pool leak)? How did you prevent it in Outpost?"
> **Answer:**  
> "A connection pool leak occurs when an application calls `pool.connect()` to acquire a client, but fails to call `client.release()` if an exception is thrown mid-execution. As unreleased clients accumulate, all pool slots become busy. When the next request arrives, it hangs waiting for an available client until it throws a `connectionTimeoutMillis` error, freezing the entire API.  
> In Outpost, we prevent pool exhaustion using strict **`try ... catch ... finally` blocks**:
> ```javascript
> const client = await getClient();
> try {
>   // transactional statements
> } finally {
>   client.release(); // GUARANTEED to execute on success or failure!
> }
> ```
> Placing `client.release()` in the `finally` block guarantees that the connection is immediately returned to the pool regardless of whether the transaction commits or aborts."

#### Q: "Why is `pool.query()` safe for `SELECT * FROM resource_nodes` but unsafe for transactions?"
> **Answer:**  
> "`pool.query()` is an internal convenience method that calls `connect()`, executes the single query string, and calls `release()` automatically. For isolated read-only queries like `GET /api/nodes`, this is safe and efficient. However, because it releases the connection immediately after one query, it cannot be used for transactions, which require multiple consecutive statements (`BEGIN`, `UPDATE`, `COMMIT`) to execute on the exact same physical backend process."
