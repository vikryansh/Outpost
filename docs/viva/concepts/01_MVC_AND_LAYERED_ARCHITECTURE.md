# Concept 01: MVC & Layered Service Architecture
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
**Model-View-Controller (MVC)** is an architectural design pattern that enforces **Separation of Concerns (SoC)** by dividing an application into three distinct interconnected components:
1. **Model:** Encapsulates the application's data schema, relational integrity constraints, and persistence layer.
2. **View:** The client-side visual presentation layer rendered in the user's browser (React, HTML/CSS).
3. **Controller:** The request-handling layer that accepts HTTP requests from the View, coordinates validation, calls business logic, and returns formatted responses.

In modern enterprise applications, the Controller is paired with a **Service Layer Pattern**:
$$\text{HTTP Request} \longrightarrow \textbf{Controller (Express Router)} \longrightarrow \textbf{Service Layer (Business Logic)} \longrightarrow \textbf{Model / Data Access Layer (PostgreSQL)}$$

---

### 2. How It Works
* **Controllers** remain "skinny": they only extract query parameters/body data, validate input types, invoke the appropriate service function, and return status codes.
* **Services** contain "fat" business logic: transactional demarcation (`BEGIN / COMMIT / ROLLBACK`), concurrency guards, inventory math, and audit hash calculation.
* **Models** define database integrity: foreign keys, `CHECK` constraints, unique indexes, and schema definitions.

---

### 3. How It Is Used in Outpost

| Layer | Files in Outpost | Role & Responsibilities |
| :--- | :--- | :--- |
| **Model** | [`server/src/db/schema.sql`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/schema.sql)<br>[`server/src/db/index.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/index.js) | Defines tables (`players`, `resource_nodes`, `inventories`, `standing_trades`, `machines`, `event_logs`), CHECK constraints (`remaining_units >= 0`), and exports the `pg.Pool` connection pool. |
| **View** | [`client/src/App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx)<br>[`client/src/components/`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/components/) | React functional components rendering the pannable map canvas, radar minimap, inventory dock, and live Concurrency Lab. |
| **Controller** | [`server/src/server.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/server.js) | Express route handlers listening on `/api/nodes/:id/harvest`, `/api/craft`, `/api/trades`, `/api/players`, parsing `req.body`, and invoking services. |
| **Service Layer** | [`server/src/services/harvestService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/harvestService.js)<br>[`server/src/services/tradeService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/tradeService.js)<br>[`server/src/services/craftService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/craftService.js)<br>[`server/src/services/machineTicker.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/machineTicker.js) | Executes raw SQL transactions, acquires row locks and advisory locks, enforces business invariants, and triggers post-commit socket notifications. |

---

### 4. Common Viva Questions & Model Answers

#### Q: "Why did you separate your backend into routes in `server.js` and services in `services/` instead of putting SQL directly in route handlers?"
> **Answer:**  
> "Placing raw SQL queries directly inside Express route handlers violates the Single Responsibility Principle and creates untestable, tightly coupled code.  
> By introducing a dedicated **Service Layer** (`harvestService.js`, `tradeService.js`):
> 1. Our automated concurrency test suites (`concurrency-race.js`, `trade-rollback.js`) can invoke service functions directly in high-speed worker loops without incurring HTTP network overhead.
> 2. Database transaction boundaries (`BEGIN`, `COMMIT`, `ROLLBACK`) and connection checkouts (`client.release()`) are encapsulated within reusable functions.
> 3. If we ever switch our transport layer (e.g. from HTTP REST to gRPC or message queues), our core business logic and transaction integrity remain 100% untouched."
