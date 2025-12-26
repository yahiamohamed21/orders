// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_PATH = path.join(DATA_DIR, "users.json");

// نفس المستخدمين اللي عندك في /api/users
function ensureUsersFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_PATH)) {
    const initial = {
      superadmin: {
        username: "superadmin",
        name: "Super Admin",
        role: "superadmin",
        target: null,
      },
      admin1: {
        username: "admin1",
        name: "Admin 1",
        role: "admin",
        target: null,
      },
      user1: {
        username: "user1",
        name: "User 1",
        role: "user",
        target: 100000,
      },
      user2: {
        username: "user2",
        name: "User 2",
        role: "user",
        target: 80000,
      },
      user3: {
        username: "user3",
        name: "User 3",
        role: "user",
        target: 60000,
      },
    };

    fs.writeFileSync(USERS_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readUsers() {
  ensureUsersFile();
  const raw = fs.readFileSync(USERS_PATH, "utf8");
  return JSON.parse(raw);
}

// هنا كلمات السر البسيطة
const CREDENTIALS = {
  superadmin: "123456",
  admin1: "123456",
  user1: "123456",
  user2: "123456",
  user3: "123456",
};

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "username و password مطلوبان" },
        { status: 400 }
      );
    }

    const expected = CREDENTIALS[username];
    if (!expected || expected !== password) {
      return NextResponse.json(
        { ok: false, error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const users = readUsers();
    const user = users[username];

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "المستخدم غير موجود في users.json" },
        { status: 404 }
      );
    }

    const role = user.role || "user";

    const res = NextResponse.json({ ok: true, role });

    // نكتب الكوكيز
    res.cookies.set("user", username, {
      httpOnly: true,
      path: "/",
    });
    res.cookies.set("role", role, {
      httpOnly: true,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
