import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { getPool } from "@/utils/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Nejste přihlášen/a." }, { status: 401 });
  }
  const { username, profilePic } = await req.json();
  if (!username) {
    return NextResponse.json({ error: "Uživatelské jméno je povinné." }, { status: 400 });
  }
  const pool = getPool();
  try {
    // Check if username is already taken by another user
    const exists = await pool.query(
      "SELECT id FROM users WHERE username = $1 AND email != $2",
      [username, session.user.email]
    );
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: "Toto uživatelské jméno je již obsazené." }, { status: 400 });
    }
    // Update user
    await pool.query(
      "UPDATE users SET username = $1, profile_pic = $2 WHERE email = $3",
      [username, profilePic || null, session.user.email]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return NextResponse.json({ error: "Nepodařilo se uložit změny." }, { status: 500 });
  }
}
