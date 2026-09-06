import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const GREEN_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD9EAD3' } // Màu xanh nhạt chuẩn Excel (#D9EAD3)
};

const ORANGE_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFCE5CD' } // Màu cam/đào nhạt chuẩn Excel (#FCE5CD)
};

const THIN_BORDER = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

function format6Digits(num) {
  if (num === undefined || num === null || isNaN(Number(num))) return '000000';
  return String(Math.round(Number(num))).padStart(6, '0');
}

/**
 * Xuất file Excel theo đúng mẫu ảnh đính kèm của người dùng:
 * - Bảng trái: Doanh thu tiền phòng (Số phòng, Điện cũ/mới/tiêu thụ, Phí dịch vụ, Nước, Xe, Tiền phòng, Tổng thu)
 * - Bảng phải: Chi phí (Chi phí cố định, Chi phí phát sinh, Tổng chi phí)
 * - Màu sắc, viền, font chữ, căn lề và công thức tính toán đồng nhất 100%
 */
export async function exportMonthlyReportToExcel({
  building,
  selectedMonth,
  invoices = [],
  expenses = [],
  config = {}
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Quản Lý Phòng Trọ';
  workbook.lastModifiedBy = 'Quản Lý Phòng Trọ';
  workbook.created = new Date();
  workbook.modified = new Date();

  const [yearStr, monthStr] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-');
  const monthNum = parseInt(monthStr, 10);
  const sheetTitle = `T${monthNum}-${yearStr}`;
  const worksheet = workbook.addWorksheet(sheetTitle, {
    views: [{ showGridLines: true }]
  });

  // Tên tòa nhà sạch để hiển thị tiêu đề
  const rawBuildingName = building?.name || 'XÔ VIẾT NGHỆ TĨNH';
  let displayBuildingName = rawBuildingName.toUpperCase();
  // Nếu có dạng "702/30 Xô Viết Nghệ Tĩnh", chuẩn hóa đẹp:
  if (displayBuildingName.includes('XÔ VIẾT NGHỆ TĨNH')) {
    displayBuildingName = 'XÔ VIẾT NGHỆ TĨNH';
  }

  const mainTitleText = `TIỀN NHÀ ${displayBuildingName} T${monthNum}-${yearStr}`;

  // Thiết lập độ rộng cột (Column Widths)
  worksheet.columns = [
    { key: 'col_a', width: 13 }, // Số phòng
    { key: 'col_b', width: 10 }, // Số cũ
    { key: 'col_c', width: 10 }, // Số mới
    { key: 'col_d', width: 14 }, // số điện máy giặt
    { key: 'col_e', width: 10 }, // tiêu thụ
    { key: 'col_f', width: 10 }, // VNĐ/KG
    { key: 'col_g', width: 13 }, // Thành tiền điện
    { key: 'col_h', width: 14 }, // phí dịch vụ Thành tiền
    { key: 'col_i', width: 13 }, // tiền nước
    { key: 'col_j', width: 13 }, // tiền xe
    { key: 'col_k', width: 15 }, // Phòng/ tháng
    { key: 'col_l', width: 16 }, // TỔNG TIỀN THU
    { key: 'col_m', width: 3 },  // Cột đệm ngăn cách
    { key: 'col_n', width: 32 }, // Loại chi phí
    { key: 'col_o', width: 16 }  // Số tiền chi phí
  ];

  // 1. DÒNG 1: TIÊU ĐỀ CHÍNH (Merge A1:L1)
  const row1 = worksheet.getRow(1);
  row1.height = 32;
  worksheet.mergeCells('A1:L1');
  const cellA1 = worksheet.getCell('A1');
  cellA1.value = mainTitleText;
  cellA1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF000000' } };
  cellA1.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. DÒNG 2 & 3: TIÊU ĐỀ BẢNG THU TIỀN VÀ BẢNG CHI PHÍ
  const row2 = worksheet.getRow(2);
  const row3 = worksheet.getRow(3);
  row2.height = 24;
  row3.height = 24;

  // --- BẢNG TRÁI: DOANH THU ---
  // Cột A: Số phòng (Merge A2:A3)
  worksheet.mergeCells('A2:A3');
  const cellA2 = worksheet.getCell('A2');
  cellA2.value = 'Số phòng';
  cellA2.font = { name: 'Arial', size: 10, bold: true };
  cellA2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellA2.fill = GREEN_FILL;
  cellA2.border = THIN_BORDER;
  worksheet.getCell('A3').border = THIN_BORDER;

  // Cột B -> G: điện (Merge B2:G2)
  worksheet.mergeCells('B2:G2');
  const cellB2 = worksheet.getCell('B2');
  cellB2.value = 'điện';
  cellB2.font = { name: 'Arial', size: 10, bold: true };
  cellB2.alignment = { vertical: 'middle', horizontal: 'center' };
  cellB2.fill = GREEN_FILL;
  ['B2', 'C2', 'D2', 'E2', 'F2', 'G2'].forEach(ref => {
    worksheet.getCell(ref).border = THIN_BORDER;
    worksheet.getCell(ref).fill = GREEN_FILL;
  });

  // Dòng 3 dưới "điện"
  const subHeadersDien = [
    { col: 'B', text: 'Số cũ' },
    { col: 'C', text: 'Số mới' },
    { col: 'D', text: 'số điện máy\ngiặt' },
    { col: 'E', text: 'tiêu thụ' },
    { col: 'F', text: 'VNĐ/KG' },
    { col: 'G', text: 'Thành tiền' }
  ];
  subHeadersDien.forEach(sh => {
    const c = worksheet.getCell(`${sh.col}3`);
    c.value = sh.text;
    c.font = { name: 'Arial', size: 10, bold: true };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.fill = GREEN_FILL;
    c.border = THIN_BORDER;
  });

  // Cột H: phí dịch vụ Thành tiền (Merge H2:H3)
  worksheet.mergeCells('H2:H3');
  const cellH2 = worksheet.getCell('H2');
  cellH2.value = 'phí dịch vụ\nThành tiền';
  cellH2.font = { name: 'Arial', size: 10, bold: true };
  cellH2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellH2.fill = GREEN_FILL;
  cellH2.border = THIN_BORDER;
  worksheet.getCell('H3').border = THIN_BORDER;

  // Cột I: tiền nước (Merge I2:I3)
  worksheet.mergeCells('I2:I3');
  const cellI2 = worksheet.getCell('I2');
  cellI2.value = 'tiền nước';
  cellI2.font = { name: 'Arial', size: 10, bold: true };
  cellI2.alignment = { vertical: 'middle', horizontal: 'center' };
  cellI2.fill = ORANGE_FILL;
  cellI2.border = THIN_BORDER;
  worksheet.getCell('I3').border = THIN_BORDER;

  // Cột J: tiền xe (Merge J2:J3)
  worksheet.mergeCells('J2:J3');
  const cellJ2 = worksheet.getCell('J2');
  cellJ2.value = 'tiền xe';
  cellJ2.font = { name: 'Arial', size: 10, bold: true };
  cellJ2.alignment = { vertical: 'middle', horizontal: 'center' };
  cellJ2.fill = ORANGE_FILL;
  cellJ2.border = THIN_BORDER;
  worksheet.getCell('J3').border = THIN_BORDER;

  // Cột K: Phòng/ tháng (Merge K2:K3)
  worksheet.mergeCells('K2:K3');
  const cellK2 = worksheet.getCell('K2');
  cellK2.value = 'Phòng/ tháng';
  cellK2.font = { name: 'Arial', size: 10, bold: true };
  cellK2.alignment = { vertical: 'middle', horizontal: 'center' };
  cellK2.fill = ORANGE_FILL;
  cellK2.border = THIN_BORDER;
  worksheet.getCell('K3').border = THIN_BORDER;

  // Cột L: TỔNG TIỀN THU (Merge L2:L3)
  worksheet.mergeCells('L2:L3');
  const cellL2 = worksheet.getCell('L2');
  cellL2.value = 'TỔNG TIỀN\nTHU';
  cellL2.font = { name: 'Arial', size: 10, bold: true };
  cellL2.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cellL2.fill = ORANGE_FILL;
  cellL2.border = THIN_BORDER;
  worksheet.getCell('L3').border = THIN_BORDER;

  // --- BẢNG PHẢI: CHI PHÍ ---
  // Row 2: Chi phí (Merge N2:O2)
  worksheet.mergeCells('N2:O2');
  const cellN2 = worksheet.getCell('N2');
  cellN2.value = 'Chi phí';
  cellN2.font = { name: 'Arial', size: 10, bold: true };
  cellN2.alignment = { vertical: 'middle', horizontal: 'center' };
  cellN2.fill = GREEN_FILL;
  worksheet.getCell('N2').border = THIN_BORDER;
  worksheet.getCell('O2').border = THIN_BORDER;
  worksheet.getCell('O2').fill = GREEN_FILL;

  // Row 3: Loại chi phí | Số tiền
  const cellN3 = worksheet.getCell('N3');
  cellN3.value = 'Loại chi phí';
  cellN3.font = { name: 'Arial', size: 10, bold: true };
  cellN3.alignment = { vertical: 'middle', horizontal: 'center' };
  cellN3.fill = GREEN_FILL;
  cellN3.border = THIN_BORDER;

  const cellO3 = worksheet.getCell('O3');
  cellO3.value = 'Số tiền';
  cellO3.font = { name: 'Arial', size: 10, bold: true };
  cellO3.alignment = { vertical: 'middle', horizontal: 'center' };
  cellO3.fill = GREEN_FILL;
  cellO3.border = THIN_BORDER;

  // Sắp xếp danh sách hóa đơn theo thứ tự phòng
  const sortedInvoices = [...invoices].sort((a, b) => {
    const orderA = a.room?.orderIndex !== undefined ? a.room.orderIndex : 999;
    const orderB = b.room?.orderIndex !== undefined ? b.room.orderIndex : 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.room?.name || '').localeCompare(b.room?.name || '', undefined, { numeric: true });
  });

  const giaDien = Number(config?.giaDien) || 3800;

  // 3. ĐIỀN DỮ LIỆU CÁC DÒNG PHÒNG (Bắt đầu từ Dòng 4)
  const startRow = 4;
  let currentRow = startRow;

  sortedInvoices.forEach((inv) => {
    const r = worksheet.getRow(currentRow);
    r.height = 20;

    const roomName = inv.room?.name || `Phòng ${currentRow - startRow + 1}`;
    const oldRead = Number(inv.oldReading) || 0;
    const newRead = Number(inv.newReading) || 0;
    const kwhUsed = Math.max(0, (newRead - oldRead) / 10);
    const electricityCost = Math.round(kwhUsed * giaDien);

    // Phí dịch vụ
    const extraFees = Array.isArray(config?.extraFeesDefault) && config.extraFeesDefault.length > 0
      ? config.extraFeesDefault
      : (Array.isArray(inv.extraFees) ? inv.extraFees : []);
    const extraFeesTotal = extraFees.reduce((s, f) => s + (Number(f.amount) || 0), 0) || 150000;

    // Tiền nước
    const waterMode = inv.room?.waterMode || 'perPerson';
    const waterAmount = Number(inv.room?.waterAmount) || 100000;
    const soNguoi = Number(inv.room?.soNguoi) || 0;
    const waterTotal = waterMode === 'fixed' ? waterAmount : waterAmount * soNguoi;

    // Tiền xe
    const parkingMode = inv.room?.parkingMode || 'perVehicle';
    const parkingAmount = inv.room?.parkingAmount !== undefined ? Number(inv.room.parkingAmount) : 150000;
    const soXe = Number(inv.room?.soXe) || 0;
    let parkingTotal = 0;
    if (parkingMode === 'perPerson') parkingTotal = parkingAmount * soNguoi;
    else if (parkingMode === 'perVehicle') parkingTotal = parkingAmount * soXe;
    else if (parkingMode === 'fixed') parkingTotal = parkingAmount;

    // Tiền phòng gốc
    const baseRent = Number(inv.room?.baseRent) || 0;

    // Col A: Số phòng
    const cA = worksheet.getCell(`A${currentRow}`);
    cA.value = roomName;
    cA.font = { name: 'Arial', size: 10 };
    cA.alignment = { vertical: 'middle', horizontal: 'center' };
    cA.border = THIN_BORDER;

    // Col B: Số cũ (định dạng 6 số 099390)
    const cB = worksheet.getCell(`B${currentRow}`);
    cB.value = format6Digits(oldRead);
    cB.font = { name: 'Arial', size: 10 };
    cB.alignment = { vertical: 'middle', horizontal: 'center' };
    cB.border = THIN_BORDER;

    // Col C: Số mới (định dạng 6 số 100783)
    const cC = worksheet.getCell(`C${currentRow}`);
    cC.value = format6Digits(newRead);
    cC.font = { name: 'Arial', size: 10 };
    cC.alignment = { vertical: 'middle', horizontal: 'center' };
    cC.border = THIN_BORDER;

    // Col D: số điện máy giặt (để trống nếu chưa có)
    const cD = worksheet.getCell(`D${currentRow}`);
    cD.value = '';
    cD.font = { name: 'Arial', size: 10 };
    cD.alignment = { vertical: 'middle', horizontal: 'center' };
    cD.border = THIN_BORDER;

    // Col E: tiêu thụ
    const cE = worksheet.getCell(`E${currentRow}`);
    cE.value = kwhUsed === 0 ? 0 : Number(kwhUsed.toFixed(1));
    cE.numFmt = kwhUsed % 1 === 0 && kwhUsed === 0 ? '0' : '0.0';
    cE.font = { name: 'Arial', size: 10 };
    cE.alignment = { vertical: 'middle', horizontal: 'center' };
    cE.border = THIN_BORDER;

    // Col F: VNĐ/KG
    const cF = worksheet.getCell(`F${currentRow}`);
    cF.value = giaDien;
    cF.numFmt = '#,##0';
    cF.font = { name: 'Arial', size: 10 };
    cF.alignment = { vertical: 'middle', horizontal: 'center' };
    cF.border = THIN_BORDER;

    // Col G: Thành tiền điện (Dùng công thức =E*F hoặc giá trị trực tiếp)
    const cG = worksheet.getCell(`G${currentRow}`);
    cG.value = { formula: `ROUND(E${currentRow}*F${currentRow},0)`, result: electricityCost };
    cG.numFmt = '#,##0';
    cG.font = { name: 'Arial', size: 10 };
    cG.alignment = { vertical: 'middle', horizontal: 'right' };
    cG.border = THIN_BORDER;

    // Col H: phí dịch vụ Thành tiền
    const cH = worksheet.getCell(`H${currentRow}`);
    cH.value = extraFeesTotal;
    cH.numFmt = '#,##0';
    cH.font = { name: 'Arial', size: 10 };
    cH.alignment = { vertical: 'middle', horizontal: 'right' };
    cH.border = THIN_BORDER;

    // Col I: tiền nước
    const cI = worksheet.getCell(`I${currentRow}`);
    cI.value = waterTotal;
    cI.numFmt = '#,##0';
    cI.font = { name: 'Arial', size: 10 };
    cI.alignment = { vertical: 'middle', horizontal: 'right' };
    cI.border = THIN_BORDER;

    // Col J: tiền xe
    const cJ = worksheet.getCell(`J${currentRow}`);
    cJ.value = parkingTotal;
    cJ.numFmt = '#,##0';
    cJ.font = { name: 'Arial', size: 10 };
    cJ.alignment = { vertical: 'middle', horizontal: 'right' };
    cJ.border = THIN_BORDER;

    // Col K: Phòng/ tháng
    const cK = worksheet.getCell(`K${currentRow}`);
    cK.value = baseRent;
    cK.numFmt = '#,##0';
    cK.font = { name: 'Arial', size: 10 };
    cK.alignment = { vertical: 'middle', horizontal: 'right' };
    cK.border = THIN_BORDER;

    // Col L: TỔNG TIỀN THU (Công thức =G+H+I+J+K)
    const computedTotal = electricityCost + extraFeesTotal + waterTotal + parkingTotal + baseRent;
    const cL = worksheet.getCell(`L${currentRow}`);
    cL.value = { formula: `G${currentRow}+H${currentRow}+I${currentRow}+J${currentRow}+K${currentRow}`, result: computedTotal };
    cL.numFmt = '#,##0';
    cL.font = { name: 'Arial', size: 10, bold: true };
    cL.alignment = { vertical: 'middle', horizontal: 'right' };
    cL.border = THIN_BORDER;

    currentRow++;
  });

  const lastDataRow = currentRow - 1;

  // 4. DÒNG TỔNG CỘNG CỦA BẢNG DOANH THU
  const totalRow = currentRow;
  const rTot = worksheet.getRow(totalRow);
  rTot.height = 22;

  // Col A: TỔNG
  const tA = worksheet.getCell(`A${totalRow}`);
  tA.value = 'TỔNG';
  tA.font = { name: 'Arial', size: 10, bold: true };
  tA.alignment = { vertical: 'middle', horizontal: 'center' };
  tA.fill = GREEN_FILL;
  tA.border = THIN_BORDER;

  // Cols B -> F: ô trống có viền
  ['B', 'C', 'D', 'E', 'F'].forEach(c => {
    const cell = worksheet.getCell(`${c}${totalRow}`);
    cell.value = '';
    cell.border = THIN_BORDER;
  });

  // Cols G -> L: Công thức SUM có nền xanh nhạt và viền
  ['G', 'H', 'I', 'J', 'K', 'L'].forEach(c => {
    const cell = worksheet.getCell(`${c}${totalRow}`);
    cell.value = { formula: `SUM(${c}${startRow}:${c}${lastDataRow})` };
    cell.numFmt = '#,##0';
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'right' };
    cell.fill = GREEN_FILL;
    cell.border = THIN_BORDER;
  });

  // Dòng ghi chú dưới bảng thu tiền
  const noteRow = totalRow + 2;
  worksheet.mergeCells(`A${noteRow}:L${noteRow}`);
  const cNote = worksheet.getCell(`A${noteRow}`);
  cNote.value = `Ghi chú: Đơn giá điện ${giaDien.toLocaleString('vi-VN')}đ/kWh. "Số điện máy giặt" chưa có dữ liệu, để trống — điền khi có số liệu`;
  cNote.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF333333' } };
  cNote.alignment = { vertical: 'middle', horizontal: 'left' };

  // 5. ĐIỀN DỮ LIỆU BẢNG CHI PHÍ (Cột N & O)
  // Phân loại chi phí cố định & chi phí phát sinh
  const fixedExpenses = expenses.filter(e => e.type === 'fixed');
  const variableExpenses = expenses.filter(e => e.type === 'variable');

  let expRow = 4;

  // 5.1 HEADER: CHI PHÍ CỐ ĐỊNH (Merge N4:O4)
  worksheet.mergeCells(`N${expRow}:O${expRow}`);
  const cFCHeader = worksheet.getCell(`N${expRow}`);
  cFCHeader.value = 'CHI PHÍ CỐ ĐỊNH';
  cFCHeader.font = { name: 'Arial', size: 10, bold: true };
  cFCHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  cFCHeader.fill = ORANGE_FILL;
  worksheet.getCell(`N${expRow}`).border = THIN_BORDER;
  worksheet.getCell(`O${expRow}`).border = THIN_BORDER;
  worksheet.getCell(`O${expRow}`).fill = ORANGE_FILL;
  expRow++;

  const startFixedRow = expRow;
  if (fixedExpenses.length === 0) {
    // Mặc định các khoản chi phí cố định như trong ảnh mẫu nếu tháng chưa nhập
    const defaultFixed = [
      { title: 'Phí quản lí', amount: 1500000 },
      { title: 'Phí công an', amount: 1000000 },
      { title: 'Phí điện +Nước', amount: 3140000 },
      { title: 'Phí mặt bằng', amount: 35000000 }
    ];
    defaultFixed.forEach(f => {
      const cN = worksheet.getCell(`N${expRow}`);
      cN.value = f.title;
      cN.font = { name: 'Arial', size: 10 };
      cN.alignment = { vertical: 'middle', horizontal: 'left' };
      cN.border = THIN_BORDER;

      const cO = worksheet.getCell(`O${expRow}`);
      cO.value = f.amount;
      cO.numFmt = '#,##0';
      cO.font = { name: 'Arial', size: 10 };
      cO.alignment = { vertical: 'middle', horizontal: 'right' };
      cO.border = THIN_BORDER;
      expRow++;
    });
  } else {
    fixedExpenses.forEach(f => {
      const cN = worksheet.getCell(`N${expRow}`);
      cN.value = f.title;
      cN.font = { name: 'Arial', size: 10 };
      cN.alignment = { vertical: 'middle', horizontal: 'left' };
      cN.border = THIN_BORDER;

      const cO = worksheet.getCell(`O${expRow}`);
      cO.value = Number(f.amount) || 0;
      cO.numFmt = '#,##0';
      cO.font = { name: 'Arial', size: 10 };
      cO.alignment = { vertical: 'middle', horizontal: 'right' };
      cO.border = THIN_BORDER;
      expRow++;
    });
  }
  const endFixedRow = expRow - 1;

  // DÒNG TỔNG CHI PHÍ CỐ ĐỊNH
  const fixedTotalRow = expRow;
  const cTotFixedTitle = worksheet.getCell(`N${fixedTotalRow}`);
  cTotFixedTitle.value = 'Tổng chi phí cố định';
  cTotFixedTitle.font = { name: 'Arial', size: 10, bold: true };
  cTotFixedTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  cTotFixedTitle.fill = GREEN_FILL;
  cTotFixedTitle.border = THIN_BORDER;

  const cTotFixedVal = worksheet.getCell(`O${fixedTotalRow}`);
  cTotFixedVal.value = { formula: `SUM(O${startFixedRow}:O${endFixedRow})` };
  cTotFixedVal.numFmt = '#,##0';
  cTotFixedVal.font = { name: 'Arial', size: 10, bold: true };
  cTotFixedVal.alignment = { vertical: 'middle', horizontal: 'right' };
  cTotFixedVal.fill = GREEN_FILL;
  cTotFixedVal.border = THIN_BORDER;
  expRow++;

  // 5.2 HEADER: CHI PHÍ PHÁT SINH (Merge N:O)
  worksheet.mergeCells(`N${expRow}:O${expRow}`);
  const cVCHeader = worksheet.getCell(`N${expRow}`);
  cVCHeader.value = 'CHI PHÍ PHÁT SINH';
  cVCHeader.font = { name: 'Arial', size: 10, bold: true };
  cVCHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  cVCHeader.fill = ORANGE_FILL;
  worksheet.getCell(`N${expRow}`).border = THIN_BORDER;
  worksheet.getCell(`O${expRow}`).border = THIN_BORDER;
  worksheet.getCell(`O${expRow}`).fill = ORANGE_FILL;
  expRow++;

  const startVarRow = expRow;
  if (variableExpenses.length === 0) {
    const defaultVar = [
      { title: 'tiền sửa chữa tủ lạnh + vệ sinh', amount: 1450000 },
      { title: 'Phí khóa cửa p9', amount: 60000 }
    ];
    defaultVar.forEach(v => {
      const cN = worksheet.getCell(`N${expRow}`);
      cN.value = v.title;
      cN.font = { name: 'Arial', size: 10 };
      cN.alignment = { vertical: 'middle', horizontal: 'left' };
      cN.border = THIN_BORDER;

      const cO = worksheet.getCell(`O${expRow}`);
      cO.value = v.amount;
      cO.numFmt = '#,##0';
      cO.font = { name: 'Arial', size: 10 };
      cO.alignment = { vertical: 'middle', horizontal: 'right' };
      cO.border = THIN_BORDER;
      expRow++;
    });
  } else {
    variableExpenses.forEach(v => {
      const cN = worksheet.getCell(`N${expRow}`);
      cN.value = v.title;
      cN.font = { name: 'Arial', size: 10 };
      cN.alignment = { vertical: 'middle', horizontal: 'left' };
      cN.border = THIN_BORDER;

      const cO = worksheet.getCell(`O${expRow}`);
      cO.value = Number(v.amount) || 0;
      cO.numFmt = '#,##0';
      cO.font = { name: 'Arial', size: 10 };
      cO.alignment = { vertical: 'middle', horizontal: 'right' };
      cO.border = THIN_BORDER;
      expRow++;
    });
  }
  const endVarRow = expRow - 1;

  // DÒNG TỔNG CHI PHÍ PHÁT SINH
  const varTotalRow = expRow;
  const cTotVarTitle = worksheet.getCell(`N${varTotalRow}`);
  cTotVarTitle.value = 'Tổng chi phí phát sinh';
  cTotVarTitle.font = { name: 'Arial', size: 10, bold: true };
  cTotVarTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  cTotVarTitle.fill = GREEN_FILL;
  cTotVarTitle.border = THIN_BORDER;

  const cTotVarVal = worksheet.getCell(`O${varTotalRow}`);
  cTotVarVal.value = { formula: `SUM(O${startVarRow}:O${endVarRow})` };
  cTotVarVal.numFmt = '#,##0';
  cTotVarVal.font = { name: 'Arial', size: 10, bold: true };
  cTotVarVal.alignment = { vertical: 'middle', horizontal: 'right' };
  cTotVarVal.fill = GREEN_FILL;
  cTotVarVal.border = THIN_BORDER;
  expRow++;

  // 5.3 DÒNG TỔNG CHI PHÍ CUỐI CÙNG
  const grandTotalRow = expRow;
  const cGrandTotTitle = worksheet.getCell(`N${grandTotalRow}`);
  cGrandTotTitle.value = 'TỔNG CHI PHÍ';
  cGrandTotTitle.font = { name: 'Arial', size: 10, bold: true };
  cGrandTotTitle.alignment = { vertical: 'middle', horizontal: 'left' };
  cGrandTotTitle.fill = GREEN_FILL;
  cGrandTotTitle.border = THIN_BORDER;

  const cGrandTotVal = worksheet.getCell(`O${grandTotalRow}`);
  cGrandTotVal.value = { formula: `O${fixedTotalRow}+O${varTotalRow}` };
  cGrandTotVal.numFmt = '#,##0';
  cGrandTotVal.font = { name: 'Arial', size: 10, bold: true };
  cGrandTotVal.alignment = { vertical: 'middle', horizontal: 'right' };
  cGrandTotVal.fill = GREEN_FILL;
  cGrandTotVal.border = THIN_BORDER;

  // Tạo buffer và kích hoạt tải về máy
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const fileName = `Tien_Nha_${displayBuildingName.replace(/\s+/g, '_')}_T${monthNum}_${yearStr}.xlsx`;
  saveAs(blob, fileName);

  return true;
}
