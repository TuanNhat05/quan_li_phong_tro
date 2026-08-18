import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export function subscribeToEvents({ onRoomUpdated, onInvoiceUpdated, onConfigUpdated }) {
  if (onRoomUpdated) socket.on('room:updated', onRoomUpdated);
  if (onInvoiceUpdated) socket.on('invoice:updated', onInvoiceUpdated);
  if (onConfigUpdated) socket.on('config:updated', onConfigUpdated);

  return () => {
    if (onRoomUpdated) socket.off('room:updated', onRoomUpdated);
    if (onInvoiceUpdated) socket.off('invoice:updated', onInvoiceUpdated);
    if (onConfigUpdated) socket.off('config:updated', onConfigUpdated);
  };
}
