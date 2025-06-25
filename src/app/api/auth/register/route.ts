import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/utils/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, username, profilePic } = await req.json();
  if (!email || !password || !username) {
    return NextResponse.json({ error: "Email, password a uživatelské jméno jsou povinné." }, { status: 400 });
  }
  const pool = getPool();
  try {
    // Check if user already exists (by email or username)
    const exists = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username]);
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Uživatel s tímto emailem nebo jménem již existuje." }, { status: 400 });
    }
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    // Insert new user with username and profilePic
    await pool.query(
      "INSERT INTO users (email, password, username, profile_pic) VALUES ($1, $2, $3, $4)",
      [email, hashed, username, profilePic || null]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
