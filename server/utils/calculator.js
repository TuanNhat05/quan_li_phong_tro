/**
 * Helper to format 6-digit meter reading as display string (e.g., 099390 → "09939.0")
 */
function formatMeterReading(rawValue) {
  const num = Number(rawValue) || 0;
  const str = String(num).padStart(6, '0');
  return str.slice(0, 5) + '.' + str.slice(5);
}

/**
 * Helper to compute runtime amounts for an invoice given Room details and Config
 *
 * Electricity reading logic:
 * - User inputs 6-digit meter readings as shown on the meter (e.g., 099390)
 * - The meter has 5 integer digits + 1 decimal digit (1/10 kWh)
 * - So 099390 represents 09939.0 kWh
 * - kWh used = (newReading - oldReading) / 10
 * - Example: 099390 → 099490 = (099490 - 099390) / 10 = 10 kWh
 */
function calculateInvoiceDetails(invoiceDoc, roomDoc, configDoc) {
  const invoice = invoiceDoc.toObject ? invoiceDoc.toObject() : { ...invoiceDoc };
  const room = roomDoc ? (roomDoc.toObject ? roomDoc.toObject() : roomDoc) : {};
  const giaDien = configDoc?.giaDien || 3500;

  const oldReading = Number(invoice.oldReading) || 0;
  const newReading = Number(invoice.newReading) || 0;
  // 6-digit meter: last digit is 1/10 kWh, so divide difference by 10
  const kwhUsed = Math.max(0, (newReading - oldReading) / 10);
  const electricityAmount = kwhUsed * giaDien;

  const waterMode = room.waterMode || 'perPerson';
  const waterAmount = Number(room.waterAmount) || 0;
  const soNguoi = Number(room.soNguoi) || 0;
  const waterAmountTotal = waterMode === 'fixed' ? waterAmount : waterAmount * soNguoi;

  const parkingMode = room.parkingMode || 'perVehicle';
  const parkingAmount = room.parkingAmount !== undefined ? Number(room.parkingAmount) : 150000;
  const soXe = Number(room.soXe) || 0;
  let parkingAmountTotal = 0;
  if (parkingMode === 'perPerson') {
    parkingAmountTotal = parkingAmount * soNguoi;
  } else if (parkingMode === 'perVehicle') {
    parkingAmountTotal = parkingAmount * soXe;
  } else if (parkingMode === 'fixed') {
    parkingAmountTotal = parkingAmount;
  } else {
    parkingAmountTotal = 0;
  }

  const extraFees = Array.isArray(invoice.extraFees) ? invoice.extraFees : [];
  const extraFeesTotal = extraFees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);

  const baseRent = Number(room.baseRent) || 0;
  const totalAmount = baseRent + electricityAmount + waterAmountTotal + parkingAmountTotal + extraFeesTotal;

  return {
    ...invoice,
    room,
    giaDien,
    kwhUsed,
    electricityAmount,
    oldReadingDisplay: formatMeterReading(oldReading),
    newReadingDisplay: formatMeterReading(newReading),
    waterAmountTotal,
    parkingAmountTotal,
    extraFeesTotal,
    baseRent,
    totalAmount
  };
}

module.exports = { calculateInvoiceDetails, formatMeterReading };
