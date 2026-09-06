const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (window.location.port === '5173') {
      return `http://${host}:5000/api`;
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getDefaultApiUrl();

// --- BUILDINGS API ---
export async function fetchBuildings() {
  const res = await fetch(`${API_URL}/buildings`);
  if (!res.ok) throw new Error('Failed to fetch buildings');
  return res.json();
}

export async function createBuilding(buildingData) {
  const res = await fetch(`${API_URL}/buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildingData)
  });
  if (!res.ok) throw new Error('Failed to create building');
  return res.json();
}

export async function updateBuilding(id, buildingData) {
  const res = await fetch(`${API_URL}/buildings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildingData)
  });
  if (!res.ok) throw new Error('Failed to update building');
  return res.json();
}

export async function deleteBuilding(id) {
  const res = await fetch(`${API_URL}/buildings/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete building');
  return res.json();
}

// --- ROOMS API ---
export async function fetchRooms(buildingId) {
  const url = buildingId ? `${API_URL}/rooms?buildingId=${buildingId}` : `${API_URL}/rooms`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function createRoom(buildingId, roomData) {
  const res = await fetch(`${API_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buildingId, ...roomData })
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function updateRoom(id, roomData) {
  const res = await fetch(`${API_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
  });
  if (!res.ok) throw new Error('Failed to update room');
  return res.json();
}

export async function deleteRoom(id) {
  const res = await fetch(`${API_URL}/rooms/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete room');
  return res.json();
}

// --- CONFIG API ---
export async function fetchConfig(buildingId) {
  const url = buildingId ? `${API_URL}/config?buildingId=${buildingId}` : `${API_URL}/config`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(buildingId, configData) {
  const url = buildingId ? `${API_URL}/config?buildingId=${buildingId}` : `${API_URL}/config`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData)
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
}

// --- INVOICES API ---
export async function fetchInvoices(month, buildingId) {
  const url = buildingId ? `${API_URL}/invoices/${month}?buildingId=${buildingId}` : `${API_URL}/invoices/${month}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function patchInvoice(month, roomId, invoiceData, buildingId) {
  const url = buildingId ? `${API_URL}/invoices/${month}/${roomId}?buildingId=${buildingId}` : `${API_URL}/invoices/${month}/${roomId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });
  if (!res.ok) throw new Error('Failed to patch invoice');
  return res.json();
}

// --- DASHBOARD API ---
export async function fetchDashboard(month, buildingId) {
  const url = buildingId ? `${API_URL}/dashboard/${month}?buildingId=${buildingId}` : `${API_URL}/dashboard/${month}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

// --- EXPENSES API ---
export async function fetchExpenses(month, buildingId) {
  const url = buildingId ? `${API_URL}/expenses?month=${month}&buildingId=${buildingId}` : `${API_URL}/expenses?month=${month}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(expenseData) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create expense');
  }
  return res.json();
}

export async function updateExpense(id, expenseData) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update expense');
  }
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete expense');
  return res.json();
}

export async function copyRecurringExpenses(buildingId, fromMonth, toMonth) {
  const res = await fetch(`${API_URL}/expenses/copy-recurring`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buildingId, fromMonth, toMonth })
  });
  if (!res.ok) throw new Error('Failed to copy recurring expenses');
  return res.json();
}
