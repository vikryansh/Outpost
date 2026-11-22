# Concept 07: React Hooks, State & Component Lifecycle
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
React is a declarative, component-based user interface library. React components are pure JavaScript functions that accept **Props** (inputs passed from parent to child) and maintain internal **State** (data that changes over time). When state changes, React recalculates the **Virtual DOM**, determines the minimal diff via its reconciliation algorithm, and updates the real browser DOM.

#### The Three Core Hooks:
1. **`useState(initialValue)`:** Declares a state variable and a setter function. Changing state queues a component re-render.
2. **`useEffect(callback, dependencies)`:** Handles side effects (network fetching, WebSocket listeners, DOM timers). Runs after the component renders. If the dependency array is empty (`[]`), it runs only once upon mounting.
3. **`useRef(initialValue)`:** Returns a mutable reference object whose `.current` property persists across renders. **Crucially, updating a ref does NOT trigger a component re-render.**

---

### 2. How React Lifecycle & Hooks are Used in Outpost

#### 1. Performance Optimization with `useRef` vs `useState` in [`MapViewport.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/components/MapViewport.jsx#L20-L24)
In a high-speed $2500 \times 1400\text{ px}$ pannable terrain viewport, dragging the mouse triggers hundreds of `mousemove` events per second:
```javascript
const isDragging = useRef(false);
const dragStart = useRef({ x: 0, y: 0 });
const panStart = useRef({ x: 0, y: 0 });
```
* **Why `useRef`?** Storing `dragStart` and `isDragging` in `useState` would trigger a full React component re-render on every single pixel of mouse movement, causing frame stuttering. `useRef` allows our pan handler to update coordinates smoothly at 60 FPS without unnecessary component tree reconciliation.

#### 2. Side Effect Demarcation & Socket Cleanup in [`App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx#L68-L185)
```javascript
useEffect(() => {
  // 1. Establish event listeners upon component mount
  socket.on('NODE_STATE_UPDATED', handleNodeUpdate);
  socket.on('GLOBAL_TICKER_LOG', handleTickerLog);

  // 2. CRITICAL CLEANUP FUNCTION (Unmount / Dependency Change)
  return () => {
    socket.off('NODE_STATE_UPDATED');
    socket.off('GLOBAL_TICKER_LOG');
  };
}, [currentPlayer]);
```

#### 3. State Lifting (Parent-to-Child Coordination)
`App.jsx` acts as the single source of truth:
* `nodes`, `inventory`, `trades`, `machines`, and `currentPlayer` state live in `App.jsx`.
* Data flows downward via props into `<TopBar>`, `<MapViewport>`, `<RadarMinimap>`, and `<Sidebar>`.
* Actions flow upward via callback props (`onHarvest={handleHarvest}`, `onCraft={handleCraft}`).

---

### 3. Common Viva Questions & Model Answers

#### Q: "Why is the cleanup function in `useEffect` necessary? What happens if you omit `socket.off()`?"
> **Answer:**  
> "When a component re-renders or unmounts, if you fail to unbind event listeners in the `useEffect` cleanup return function, the old listener remains active in memory attached to the Socket.io client.  
> Every time `currentPlayer` changes or the component re-mounts, a **new duplicate listener is added**. If a single `NODE_STATE_UPDATED` event arrives, it will execute 2, 4, or 8 times simultaneously, creating a severe **memory leak** and triggering cascading redundant re-renders."

#### Q: "What is the difference between Props and State in React?"
> **Answer:**  
> "* **Props (Properties):** Immutable data passed from a parent component down to a child component (unidirectional data flow). A child cannot modify its own props.
> * **State:** Mutable data managed internally within a component using `useState`. State represents dynamic data that changes in response to user actions, network responses, or timers, and triggering a re-render when updated via its setter."
