const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export async function getNodes() {
  const res = await fetch(`${API_BASE}/api/nodes`);
  return res.json();
}

export async function harvestNode(nodeId, playerId = 1) {
  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}/harvest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, ...data };
}

export async function getInventory(playerId = 1) {
  const res = await fetch(`${API_BASE}/api/players/${playerId}/inventory`);
  return res.json();
}

export async function getRecipes() {
  const res = await fetch(`${API_BASE}/api/recipes`);
  return res.json();
}

export async function craftItem(playerId, item) {
  const res = await fetch(`${API_BASE}/api/craft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, item }),
  });
  return res.json();
}

export async function getTrades() {
  const res = await fetch(`${API_BASE}/api/trades`);
  return res.json();
}

export async function createTrade(tradeData) {
  const res = await fetch(`${API_BASE}/api/trades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tradeData),
  });
  return res.json();
}

export async function acceptTrade(tradeId, buyerPlayerId) {
  const res = await fetch(`${API_BASE}/api/trades/${tradeId}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buyerPlayerId }),
  });
  return res.json();
}

export async function cancelTrade(tradeId, creatorPlayerId) {
  const res = await fetch(`${API_BASE}/api/trades/${tradeId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creatorPlayerId }),
  });
  return res.json();
}

export async function getMachines() {
  const res = await fetch(`${API_BASE}/api/machines`);
  return res.json();
}

export async function deployMachine(playerId, nodeId, machineType = 'MK1_DRILL') {
  const res = await fetch(`${API_BASE}/api/machines/deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, nodeId, machineType }),
  });
  return res.json();
}

export async function collectMachineBuffer(machineId, playerId) {
  const res = await fetch(`${API_BASE}/api/machines/${machineId}/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });
  return res.json();
}

export async function getEvents() {
  const res = await fetch(`${API_BASE}/api/events`);
  return res.json();
}
