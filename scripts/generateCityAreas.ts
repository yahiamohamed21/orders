// scripts/generateCityAreas.ts
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// لأن ESM لا يدعم __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(process.cwd(), "data", "address.xlsx");  
const SHEET_NAME = "بيانات العنوان لسبيداف";

console.log("Reading Excel file from:", excelPath);

const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[SHEET_NAME];

if (!ws) {
  console.error(`❌ لم يتم العثور على الشيت: ${SHEET_NAME}`);
  process.exit(1);
}

console.log("✓ الشيت موجود.. جاري قراءة الصفوف");

const rows = XLSX.utils.sheet_to_json(ws);
const mapping = {};

for (const row of rows) {
  const city = String(row["مدينة"] || "").trim();
  const area = String(row["منطقة"] || "").trim();
  if (!city || !area) continue;

  if (!mapping[city]) mapping[city] = new Set();
  mapping[city].add(area);
}

console.log("✓ تم تجميع المدن والمناطق");

const sorted = {};
for (const city of Object.keys(mapping).sort()) {
  sorted[city] = [...mapping[city]].sort();
}

const lines = [];
lines.push('export const CITY_AREAS: Record<string, string[]> = {');

for (const city of Object.keys(sorted)) {
  const areas = sorted[city].map((a) => `"${a}"`).join(", ");
  lines.push(`  "${city}": [${areas}],`);
}

lines.push("};\n");

const outPath = path.join(process.cwd(), "app", "user", "city-areas.ts");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");

console.log("✓ تم إنشاء الملف:");
console.log(outPath);
