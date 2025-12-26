// app/api/targets/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "users.json");

function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    const initial = {};
    fs.writeFileSync(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readUsers() {
  ensureUsersFile();
  const raw = fs.readFileSync(FILE_PATH, "utf8");
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2), "utf8");
}

// GET: يرجع كل اليوزرات + التارجيت (اليوزر داشبورد بيستخدمه)
export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json({ ok: true, targets: users });
  } catch (error) {
    console.error("❌ Error reading targets:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}

// POST: تعديل التارجيت ليوزر واحد
export async function POST(req) {
  try {
    const body = await req.json();
    const { userName, target } = body;

    if (!userName || typeof target !== "number") {
      return NextResponse.json(
        { ok: false, error: "userName و target (number) مطلوبان" },
        { status: 400 }
      );
    }

    const users = readUsers();

    if (!users[userName]) {
      // لو مش موجود نعمله يوزر عادي
      users[userName] = {
        username: userName,
        name: userName,
        role: "user",
        target,
      };
    } else {
      users[userName].target = target;
    }

    writeUsers(users);

    return NextResponse.json({ ok: true, targets: users });
  } catch (error) {
    console.error("❌ Error saving target:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
