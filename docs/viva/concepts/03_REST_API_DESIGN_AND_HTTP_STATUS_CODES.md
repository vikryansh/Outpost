# Concept 03: RESTful API Principles & HTTP Status Codes
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
**REST (Representational State Transfer)** is an architectural style for networked hypermedia applications characterized by six core constraints:
1. **Client-Server Architecture:** Strict separation between user interface concerns (React) and data storage concerns (Express/PostgreSQL).
2. **Statelessness:** Every HTTP request from client to server must contain all necessary information to understand and process the request. No client context is stored on the server between requests.
3. **Uniform Interface:** Resources are identified using standard URIs, manipulated through standard representations (JSON), and operated upon using standard HTTP methods.

---

### 2. HTTP Verbs & Idempotency

| HTTP Method | CRUD Action | Semantic Meaning | Idempotent? | Outpost Implementation |
| :---: | :---: | :--- | :---: | :--- |
| `GET` | **Read** | Retrieve resource state without modifying server data. | **Yes** | `GET /api/nodes`, `GET /api/players`, `GET /api/recipes` |
| `POST` | **Create / Execute** | Submit data to create a new resource or execute a state change. | **No** | `POST /api/nodes/:id/harvest`, `POST /api/craft`, `POST /api/trades` |
| `PUT` | **Replace** | Replace an entire resource or create if non-existent. | **Yes** | Standard updates |
| `DELETE` | **Delete** | Remove the target resource. | **Yes** | `DELETE /api/trades/:id` |

* **Idempotency Rule:** An operation is idempotent if making the same call multiple times produces the exact same server state as making it once. `GET`, `PUT`, and `DELETE` are idempotent; `POST` is non-idempotent because repeatedly calling it generates multiple records or state mutations.

---

### 3. HTTP Status Codes Used in Outpost

| Status Code | Standard Name | Exactly When Outpost Emits It | Course Rubric Context |
| :---: | :--- | :--- | :--- |
| **`200 OK`** | Success | Node harvested, item crafted, trade accepted, data queried successfully. | Standard successful operations. |
| **`201 Created`** | Resource Created | New player enlisted via `POST /api/players` or standing offer posted via `POST /api/trades`. | Resource creation standard. |
| **`400 Bad Request`** | Client Syntax Error | Missing required body parameters (e.g. empty callsign or missing item name). | Frontline parameter validation. |
| **`403 Forbidden`** | Authorization Refusal | Non-owner player attempts to collect ore from another player's automated MK-1 drill buffer. | Resource ownership enforcement. |
| **`404 Not Found`** | Resource Non-Existent | Node ID, trade ID, or machine ID does not exist in the database. | Standard missing entity handling. |
| **`409 Conflict`** | State Conflict | **The Concurrency Code.** Returned when a player clicks "Extract" on a node whose stock was already reduced to 0 by a competing simultaneous request. Also returned if a username is already registered. | Core requirement for concurrency defense. |
| **`422 Unprocessable`** | Semantic / Business Error | Request syntax is valid JSON, but business logic invariants are violated (e.g. player lacks required copper or iron to craft a circuit board). | Strict business invariant enforcement. |
| **`500 Internal Error`** | Server / Database Fault | Unexpected database connection failure or uncaught query exception. | Database safety boundary. |

---

### 4. Common Viva Questions & Model Answers

#### Q: "Why did you use status code `409 Conflict` instead of `400 Bad Request` when a resource node is exhausted?"
> **Answer:**  
> "`400 Bad Request` indicates malformed client syntax—such as invalid JSON, missing parameters, or incorrect data types. The client made an error in the request format.  
> `409 Conflict` specifically signals that the client's request was well-formed, but could not be processed due to a **conflict with the current authoritative state of the target resource**. In our system, two users simultaneously requested the last unit of ore. The second user's request was syntactically perfect, but conflicted with the newly committed database state (stock = 0). `409 Conflict` is the exact semantic RFC standard for race condition outcomes."

#### Q: "Why did you return `422 Unprocessable Entity` for crafting failures instead of `400 Bad Request`?"
> **Answer:**  
> "Under RFC 4918, HTTP `422 Unprocessable Entity` indicates that the server understands the content type and the syntax of the request entity is correct, but it was unable to process the contained instructions due to semantic business validation errors. The payload `{\"playerId\": 1, \"item\": \"circuit_board\"}` is valid JSON, but the player possesses insufficient copper wire in their inventory. It is a business-rule deficiency, making 422 the most precise status code."
