import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Next.js App Router: params je Promise pouze v route.ts, zde je to objekt
export async function PATCH(req: NextRequest, context: { params: { category: string; recipe: string } }) {
    try {
        const { category, recipe } = context.params;
        const { rating } = await req.json();
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Neplatné hodnocení' }, { status: 400 });
        }
        // Aktualizace rating_sum a rating_count
        const result = await sql`
            UPDATE recipes
            SET rating_sum = COALESCE(rating_sum,0) + ${rating},
                rating_count = COALESCE(rating_count,0) + 1
            WHERE category = ${decodeURIComponent(category)} AND slug = ${decodeURIComponent(recipe)}
            RETURNING rating_sum, rating_count
        `;
        if (result.length === 0) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }
        return NextResponse.json({ rating_sum: result[0].rating_sum, rating_count: result[0].rating_count });
    } catch {
        return NextResponse.json({ error: 'Chyba při ukládání hodnocení' }, { status: 500 });
    }
}
