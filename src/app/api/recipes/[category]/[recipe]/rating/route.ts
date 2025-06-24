import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const sql = neon(process.env.DATABASE_URL!);

export async function PATCH(req: NextRequest, context: { params: Promise<{ category: string; recipe: string }> }) {
    try {
        const { category, recipe } = await context.params;
        const cookieName = `voted_${category}_${recipe}`;
        const cookieStore = await cookies();
        const alreadyVoted = cookieStore.get(cookieName);
        if (alreadyVoted) {
            return NextResponse.json({ error: 'Již jste hlasovali.' }, { status: 403 });
        }
        const { rating } = await req.json();
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Neplatné hodnocení' }, { status: 400 });
        }
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
        const response = NextResponse.json({ rating_sum: result[0].rating_sum, rating_count: result[0].rating_count });
        response.cookies.set(cookieName, '1', { maxAge: 60 * 60 * 24 * 365 }); // 1 rok
        return response;
    } catch {
        return NextResponse.json({ error: 'Chyba při ukládání hodnocení' }, { status: 500 });
    }
}
