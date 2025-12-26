// app/api/users/route.js
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
    const initial = {
      superadmin: {
        username: "superadmin",
        name: "Super Admin",
        role: "superadmin", // superadmin | admin | user
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

export async function GET() {
  try {
    const data = readUsers();
    return NextResponse.json({ ok: true, users: data });
  } catch (error) {
    console.error("❌ Error reading users:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, name, role, target } = body;

    if (!username || !name || !role) {
      return NextResponse.json(
        { ok: false, error: "username, name, role مطلوبين" },
        { status: 400 }
      );
    }

    const allowedRoles = ["superadmin", "admin", "user"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { ok: false, error: "role غير صحيح" },
        { status: 400 }
      );
    }

    const data = readUsers();

    data[username] = {
      username,
      name,
      role,
      target:
        typeof target === "number" && !Number.isNaN(target)
          ? target
          : data[username]?.target ?? null,
    };

    writeUsers(data);

    return NextResponse.json({ ok: true, users: data });
  } catch (error) {
    console.error("❌ Error saving user:", error);
    return NextResponse.json(
      { ok: false, error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
