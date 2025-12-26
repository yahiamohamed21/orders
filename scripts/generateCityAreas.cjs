// scripts/generateCityAreas.cjs
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(process.cwd(), "data", "address.xlsx"); // اسم الملف اللي عندك
const SHEET_NAME = "بيانات العنوان لسبيداف"; // اسم الشيت اللي فيه (مدينة / منطقة)

console.log("📄 Reading Excel file from:", excelPath);

if (!fs.existsSync(excelPath)) {
  console.error("❌ ملف الإكسيل غير موجود في هذا المسار");
  process.exit(1);
}

const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[SHEET_NAME];

if (!ws) {
  console.error(`❌ لم يتم العثور على الشيت: ${SHEET_NAME}`);
  process.exit(1);
}

console.log("✓ الشيت موجود.. جاري قراءة الصفوف");

const rows = XLSX.utils.sheet_to_json(ws);
const mapping = {}; // { city: Set(areas) }

for (const row of rows) {
  const city = String(row["مدينة"] || "").trim();
  const area = String(row["منطقة"] || "").trim();
  if (!city || !area) continue;

  if (!mapping[city]) {
    mapping[city] = new Set();
  }
  mapping[city].add(area);
}

console.log("✓ تم تجميع المدن والمناطق");

const sorted = {}; // { city: string[] }

Object.keys(mapping)
  .sort()
  .forEach((city) => {
    sorted[city] = Array.from(mapping[city]).sort();
  });

const lines = [];
lines.push('export const CITY_AREAS: Record<string, string[]> = {');

for (const city of Object.keys(sorted)) {
  const areasArray = sorted[city].map((a) => `"${a.replace(/"/g, '\\"')}"`);
  const areas = areasArray.join(", ");
  lines.push(`  "${city.replace(/"/g, '\\"')}": [${areas}],`);
}

lines.push("};");
lines.push("");

const outPath = path.join(process.cwd(), "app", "user", "city-areas.ts");
fs.writeFileSync(outPath, lines.join("\n"), "utf8");

console.log("✓ تم إنشاء الملف:", outPath);
