# Concept 10: Server-Side vs. Client-Side Validation & Defense-in-Depth
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)

$$\textbf{The Fundamental Law of Web Security: Never Trust Client Input}$$

| Dimension | Client-Side Validation (React) | Server-Side Validation (Express & PostgreSQL) |
| :--- | :--- | :--- |
| **Location** | Executes in the user's browser (JavaScript). | Executes in the secure Node.js backend & PostgreSQL engine. |
| **Purpose** | **User Experience (UX):** Immediate feedback, disabling buttons, form field formatting, preventing accidental invalid submissions. | **Security & Integrity:** Preventing data corruption, stopping unauthorized mutations, enforcing relational constraints. |
| **Bypassability** | **Trivially Bypassed:** Anyone can open Postman, curl, or browser DevTools and send raw HTTP payloads directly to `/api/craft` or `/api/nodes/8/harvest`. | **Impossible to Bypass:** Validated by backend controllers and relational schema invariants. |

---

### 2. How Defense-in-Depth is Implemented in Outpost

Outpost implements a 3-tier validation pyramid:

```
                      ▲
                     / \
                    /   \
                   / Tier\       Tier 1: Client UI Layer (React)
                  /   1   \      • Disabled "Extract" button when remaining_units <= 0
                 /─────────\     • Recipe craft buttons disabled when ingredients deficient
                /   Tier    \    
               /     2       \   Tier 2: Express Controller & Service Layer
              /───────────────\  • Checks req.body types and presence
             /      Tier       \ • Validates inventory quantity >= required inside transaction
            /        3          \• Rejects with 409 Conflict, 403 Forbidden, or 422 Unprocessable
           /─────────────────────\
                                 Tier 3: PostgreSQL Database Engine
                                 • CHECK (remaining_units >= 0)
                                 • CHECK (quantity >= 0)
                                 • UNIQUE (player_id, item_type)
```

#### Code Examples:
1. **Tier 1 (Client):** `CraftingWorkbench.jsx` compares `have >= ing.quantity` and grays out the craft button if ingredients are missing.
2. **Tier 2 (Server Controller):** `craftService.js` queries current inventory within the transaction:
   ```javascript
   if (have < ing.quantity) {
     await client.query('ROLLBACK');
     return { success: false, status: 422, message: `Insufficient ${ing.item}` };
   }
   ```
3. **Tier 3 (Database):** If an attacker somehow bypasses Tiers 1 and 2, PostgreSQL's constraint `CHECK (quantity >= 0)` aborts the query immediately.

---

### 3. Common Viva Questions & Model Answers

#### Q: "If your React frontend already disables the Extract button when a node reaches 0, why do you need `WHERE remaining_units > 0` in your SQL query?"
> **Answer:**  
> "Client-side validation is inherently asynchronous and non-authoritative in a shared multiplayer environment:
> 1. Two players may see `1/10` remaining on their screens at the exact same moment. Both of their Extract buttons are enabled. They both click at the same instant.
> 2. Even without two players, a malicious user can open Postman or write a script sending 50 parallel POST requests directly to `/api/nodes/1/harvest`, completely bypassing React.
> 3. Therefore, the concurrency guard **must** sit inside the SQL query (`WHERE id = $1 AND remaining_units > 0`) executed atomically by the database engine. Client-side button disabling is purely for visual feedback."

#### Q: "What HTTP status code should you return when a client request bypasses the UI with deficient parameters?"
> **Answer:**  
> "* If required parameters are missing or syntactically invalid (e.g. empty callsign): **`400 Bad Request`**.
> * If the action violates semantic business invariants (e.g. deficient crafting ingredients): **`422 Unprocessable Entity`**.
> * If the action conflicts with concurrent resource state (e.g. node exhausted): **`409 Conflict`**.
> * If the action attempts unauthorized access to another user's machine: **`403 Forbidden`**."
