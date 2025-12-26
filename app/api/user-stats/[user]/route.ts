// app/api/user-stats/[user]/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "targets.json");

function ensureTargetsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(FILE_PATH)) {
    const initial = {
      user1: { target: 100000 },
      user2: { target: 80000 },
      user3: { target: 60000 },
    };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  try {
    return typeof error === "string" ? error : JSON.stringify(error);
  } catch {
    return String(error ?? "Unknown error");
  }
}

type RouteContext = { params: unknown };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    ensureTargetsFile();

    // Next 16 قد يرسل params كـ Promise أو كـ object حسب التولز/البيئة
    const p = await Promise.resolve(context.params as any);
    const user = String(p?.user ?? "");

    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);

    const userTargets = data?.[user] ?? null;

    return NextResponse.json({ ok: true, user, targets: userTargets });
  } catch (error: unknown) {
    console.error("❌ Error reading targets:", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
