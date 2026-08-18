/**
 * Format số tiền chuẩn Việt Nam với dấu chấm phân cách hàng nghìn (VD: 2.500.000 đ)
 */
export function formatVNMoney(val) {
  if (val === undefined || val === null || isNaN(val)) return '0 đ';
  const num = Number(val) || 0;
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

/**
 * Format số chuẩn Việt Nam với dấu chấm phân cách hàng nghìn không kèm đơn vị (VD: 2.500.000)
 */
export function formatVNDots(val) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const num = Number(val) || 0;
  return new Intl.NumberFormat('vi-VN').format(num);
}
