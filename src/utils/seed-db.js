import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function seed() {
  try {
    const recipesDir = path.resolve('./public/recipes');
    const files = fs.readdirSync(recipesDir);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const category = path.basename(file, '.json'); // např. "hlavni-chody"
        const filePath = path.join(recipesDir, file);

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const recipes = JSON.parse(rawData);

        for (const r of recipes) {
          await pool.query(
              `INSERT INTO recipes (title, description, category, image, time, portion, difficulty, ingredients, instructions)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [
                r.title,
                r.description,
                category,
                r.image,
                r.time,
                r.portion,
                r.difficulty,
                JSON.stringify(r.ingredients),
                JSON.stringify(r.instructions),
              ]
          );
          console.log(`Nahrán recept: ${r.title} (kategorie: ${category})`);
        }
      }
    }

    console.log('Seedování dokončeno.');
  } catch (e) {
    console.error('Chyba při seedování:', e);
  } finally {
    await pool.end();
  }
}

seed();
