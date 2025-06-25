import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { sql } from '@/utils/db';
import { authOptions } from '../auth/[...nextauth]/route';

// GET: Vrátí všechny oblíbené recepty přihlášeného uživatele
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
  }
  const favorites = await sql`SELECT * FROM favorites WHERE user_email = ${session.user.email}`;
  return NextResponse.json(favorites);
}

// POST: Přidá recept do oblíbených
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
  }
  const { slug, category, title, image } = await req.json();
  await sql`
    INSERT INTO favorites (user_email, recipe_slug, category, title, image)
    VALUES (${session.user.email}, ${slug}, ${category}, ${title}, ${image})
    ON CONFLICT (user_email, recipe_slug, category) DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

// DELETE: Odebere recept z oblíbených
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Neautorizováno' }, { status: 401 });
  }
  const { slug, category } = await req.json();
  await sql`
    DELETE FROM favorites WHERE user_email = ${session.user.email} AND recipe_slug = ${slug} AND category = ${category}
  `;
  return NextResponse.json({ ok: true });
}

