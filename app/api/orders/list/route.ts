import { NextResponse } from "next/server";
import path from "path";
import ExcelJS from "exceljs";

const ORDERS_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "orders.xlsx" // عدّل الاسم لو مختلف عندك
);

// لو حابب تربط بالسيتنجز بتاعة الفورمات، ممكن تبعت formId كـ query وتستخدمه لاحقاً
export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(ORDERS_FILE_PATH);

    // عدّل اسم الشيت حسب الفورم أو خليها أول شيت
    const sheet = workbook.getWorksheet("Orders") || workbook.worksheets[0];

    if (!sheet) {
      return NextResponse.json(
        { ok: false, error: "Worksheet not found" },
        { status: 500 }
      );
    }

    const rows: any[] = [];

    // نفترض إن الصف الأول هو الهيدر
    const headerRow = sheet.getRow(1);
    const headers: string[] = [];

    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? "").trim() || `col${colNumber}`;
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const obj: Record<string, any> = {};
      row.eachCell((cell, colNumber) => {
        const key = headers[colNumber] || `col${colNumber}`;
        obj[key] = cell.value;
      });

      // هنا لو عندك عمود اسمه "Status" تقدر تستخدمه لتحديد وصل/موصلش
      // مثال:
      // const statusValue = String(obj["Status"] ?? "").toLowerCase();
      // obj._delivered = statusValue.includes("delivered") || statusValue.includes("تم");

      rows.push(obj);
    });

    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Failed to read Excel file" },
      { status: 500 }
    );
  }
}
