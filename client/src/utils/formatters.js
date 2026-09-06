/**
 * Format số tiền chuẩn Việt Nam với dấu chấm phân cách hàng nghìn (VD: 2.500.000đ)
 */
export function formatVNMoney(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
}

/**
 * Format số chuẩn Việt Nam với dấu chấm phân cách hàng nghìn không kèm đơn vị (VD: 2.500.000)
 */
export function formatVNNumber(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('vi-VN').format(num);
}
