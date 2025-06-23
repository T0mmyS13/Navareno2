// src/app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/utils/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');

  if (!category) {
    return NextResponse.json(
      { error: 'Je vyžadován parametr category' },
      { status: 400 }
    );
  }

  try {
    // Získání receptů podle kategorie z PostgreSQL databáze
    const recipes = await sql`
      SELECT * FROM recipes 
      WHERE category = ${category}
    `;

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Chyba databáze:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se načíst recepty z databáze' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const recipe = await request.json();
    
    // Validace receptu - tady byste měli ověřit všechna potřebná pole
    if (!recipe.title || !recipe.category) {
      return NextResponse.json(
        { error: 'Neplatný recept - chybí požadovaná pole' },
        { status: 400 }
      );
    }

    // Kontrola, zda slug už existuje v dané kategorii
    const existing = await sql`
      SELECT 1 FROM recipes WHERE slug = ${recipe.slug} AND category = ${recipe.category}
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Recept s tímto názvem už existuje.' },
        { status: 409 }
      );
    }

    // Vložení nového receptu do databáze
    const result = await sql`
      INSERT INTO recipes (
        title, description, image, category, time, difficulty, 
        portion, ingredients, instructions, slug
      ) VALUES (
        ${recipe.title}, ${recipe.description}, ${recipe.image}, 
        ${recipe.category}, ${recipe.time}, ${recipe.difficulty},
        ${recipe.portion}, ${JSON.stringify(recipe.ingredients)}, 
        ${JSON.stringify(recipe.instructions)}, ${recipe.slug}
      )
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Chyba při ukládání receptu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se uložit recept' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const recipe = await request.json();

    // Validace receptu
    if (!recipe.title || !recipe.category || !recipe.slug) {
      return NextResponse.json(
        { error: 'Neplatný recept - chybí požadovaná pole' },
        { status: 400 }
      );
    }

    // Aktualizace receptu v databázi podle slug a category
    const result = await sql`
      UPDATE recipes
      SET
        title = ${recipe.title},
        description = ${recipe.description},
        image = ${recipe.image},
        time = ${recipe.time},
        difficulty = ${recipe.difficulty},
        portion = ${recipe.portion},
        ingredients = ${JSON.stringify(recipe.ingredients)},
        instructions = ${JSON.stringify(recipe.instructions)},
        slug = ${recipe.slug}
      WHERE slug = ${recipe.slug} AND category = ${recipe.category}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Recept nebyl nalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Chyba při aktualizaci receptu:', error);
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat recept' },
      { status: 500 }
    );
  }
}