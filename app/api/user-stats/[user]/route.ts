// app/api/targets/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "targets.json");

function ensureTargetsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE_PATH)) {
    const initial = {
      user1: { target: 100000 },
      user2: { target: 80000 },
      user3: { target: 60000 },
    };
    fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error ?? "Unknown error");
}

export async function GET() {
  try {
    ensureTargetsFile();
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json({ ok: true, targets: data });
  } catch (error) {
    console.error("❌ Error reading targets:", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    ensureTargetsFile();
    const body = await req.json();
    const { userName, target } = body || {};

    if (!userName || typeof target !== "number") {
      return NextResponse.json(
        { ok: false, error: "userName و target مطلوبان" },
        { status: 400 }
      );
    }

    const raw = fs.readFileSync(FILE_PATH, "utf8");
    const data = JSON.parse(raw);

    if (!data[userName]) data[userName] = {};
    data[userName].target = target;

    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({ ok: true, targets: data });
  } catch (error) {
    console.error("❌ Error saving target:", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
