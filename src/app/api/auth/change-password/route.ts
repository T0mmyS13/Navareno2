import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { getPool } from "@/utils/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Nejste přihlášen/a." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Všechna pole jsou povinná." }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Nové heslo musí mít alespoň 6 znaků." }, { status: 400 });
  }

  const pool = getPool();
  try {
    // Get current user's password
    const userResult = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [session.user.email]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Uživatel nebyl nalezen." }, { status: 404 });
    }

    const user = userResult.rows[0];
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Současné heslo není správné." }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedNewPassword, session.user.email]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Nepodařilo se změnit heslo." }, { status: 500 });
  }
}
