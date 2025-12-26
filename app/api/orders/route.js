// app/api/orders/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "orders.csv");

function ensureFileExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE_PATH)) {
    const headerRow =
      [
        "رقم بوليصة العميل",
        "نوع البضاعة",
        "اسم البضاعة",
        "العدد",
        "وزن الطلب",
        "قيمة التحصيل",
        "مبلغ ضمان السعر",
        "ما إذا كان سيتم السماح بفتح الحزمة أم لا",
        "ملاحظة",
        "الاسم",
        "هاتف",
        "مدينة",
        "منطقة",
        "عنوان المرسل إليه",
        "البريد الإلكتروني المستلم",
        "UserName",
      ].join(",") + "\n";

    // نضيف BOM في أول الملف علشان Excel يفهم UTF-8
    const headerWithBom = "\uFEFF" + headerRow;

    fs.writeFileSync(FILE_PATH, headerWithBom, { encoding: "utf8" });
  }
}


function esc(value) {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""');
  // لو فيه كومة أو سطر جديد نحطّه بين ""
  if (s.includes(",") || s.includes("\n")) return `"${s}"`;
  return s;
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("📥 Incoming order:", body);

    ensureFileExists();

    const row =
      [
        body.customerPolicyNumber || "",
        body.goodsType || "",
        body.goodsName || "",
        body.quantity ?? "",
        body.weight ?? "",
        body.collectionAmount ?? "",
        body.priceGuarantee ?? "",
        body.allowOpenPackage || "",
        body.note || "",
        body.recipientName || "",
        body.recipientPhone || "",
        body.city || "",
        body.area || "",
        body.address || "",
        body.recipientEmail || "",
        body.userName || "",
      ]
        .map(esc)
        .join(",") + "\n";

fs.appendFileSync(FILE_PATH, row, { encoding: "utf8" });

    console.log("✅ Order saved to CSV:", FILE_PATH);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
