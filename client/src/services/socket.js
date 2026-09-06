import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

// Singleton socket kết nối 1 lần duy nhất, không bị hủy khi unmount component
export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity
});

// Chỉ đăng ký / hủy đăng ký event handlers, KHÔNG disconnect socket
export function subscribeToEvents({ onRoomUpdated, onInvoiceUpdated, onConfigUpdated, onExpenseUpdated }) {
  if (onRoomUpdated) socket.on('roomUpdated', onRoomUpdated);
  if (onInvoiceUpdated) socket.on('invoiceUpdated', onInvoiceUpdated);
  if (onConfigUpdated) socket.on('configUpdated', onConfigUpdated);
  if (onExpenseUpdated) socket.on('expenseUpdated', onExpenseUpdated);

  return () => {
    if (onRoomUpdated) socket.off('roomUpdated', onRoomUpdated);
    if (onInvoiceUpdated) socket.off('invoiceUpdated', onInvoiceUpdated);
    if (onConfigUpdated) socket.off('configUpdated', onConfigUpdated);
    if (onExpenseUpdated) socket.off('expenseUpdated', onExpenseUpdated);
  };
}
