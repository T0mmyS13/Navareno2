import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ category: string; recipe: string }> }
) {
    try {
        const { category, recipe } = await context.params;

        console.log('Fetching recipe:', { category, recipe });

        const result = await sql`
            SELECT * FROM recipes
            WHERE category = ${decodeURIComponent(category)}
              AND slug = ${decodeURIComponent(recipe)}
                LIMIT 1
        `;


        if (result.length === 0) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        const recipeRow = result[0];

        return NextResponse.json({
            ...recipeRow,
            ingredients: typeof recipeRow.ingredients === 'string'
                ? JSON.parse(recipeRow.ingredients)
                : recipeRow.ingredients,
            instructions: typeof recipeRow.instructions === 'string'
                ? JSON.parse(recipeRow.instructions)
                : recipeRow.instructions,
        });
    } catch (err) {
        console.error('Database error:', err);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
