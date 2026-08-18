const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchRooms() {
  const res = await fetch(`${API_URL}/rooms`);
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return res.json();
}

export async function updateRoom(id, roomData) {
  const res = await fetch(`${API_URL}/rooms/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(roomData)
  });
  if (!res.ok) throw new Error('Failed to update room');
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_URL}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(configData) {
  const res = await fetch(`${API_URL}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData)
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
}

export async function fetchInvoices(month) {
  const res = await fetch(`${API_URL}/invoices/${month}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export async function patchInvoice(month, roomId, invoiceData) {
  const res = await fetch(`${API_URL}/invoices/${month}/${roomId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoiceData)
  });
  if (!res.ok) throw new Error('Failed to patch invoice');
  return res.json();
}

export async function fetchDashboard(month) {
  const res = await fetch(`${API_URL}/dashboard/${month}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}
