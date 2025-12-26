import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type FormConfig = {
  id: string;
  nameAr: string;
  nameEn: string;
  sheetName: string;
  active: boolean;
};

const DATA_PATH = path.join(process.cwd(), "data", "forms.json");

async function readForms(): Promise<FormConfig[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json.forms) ? json.forms : [];
  } catch (err: any) {
    // لو الملف مش موجود، ارجع قائمة فاضية
    if (err?.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

async function writeForms(forms: FormConfig[]) {
  const payload = JSON.stringify({ forms }, null, 2);
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, payload, "utf8");
}

export async function GET() {
  try {
    const forms = await readForms();
    return NextResponse.json({ ok: true, forms });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Failed to read forms" },
      { status: 500 }
    );
  }
}

// Add / update form
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      nameAr,
      nameEn,
      sheetName,
      active,
    }: {
      id: string;
      nameAr: string;
      nameEn: string;
      sheetName: string;
      active?: boolean;
    } = body;

    if (!id || !nameAr || !nameEn || !sheetName) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const forms = await readForms();
    const index = forms.findIndex((f) => f.id === id);

    const form: FormConfig = {
      id,
      nameAr,
      nameEn,
      sheetName,
      active: active ?? true,
    };

    if (index >= 0) {
      forms[index] = form;
    } else {
      forms.push(form);
    }

    await writeForms(forms);

    return NextResponse.json({ ok: true, forms });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Failed to save form" },
      { status: 500 }
    );
  }
}

// Delete form
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body as { id?: string };

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing form id" },
        { status: 400 }
      );
    }

    const forms = await readForms();
    const filtered = forms.filter((f) => f.id !== id);

    await writeForms(filtered);

    return NextResponse.json({ ok: true, forms: filtered });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete form" },
      { status: 500 }
    );
  }
}
