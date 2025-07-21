import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Vytvoření readline interface pro interaktivní vstup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Pomocná funkce pro async prompt
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
};

function generateSlug(str) {
  return str
    ? str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
    : str;
}

async function seed() {
  try {
    const recipesDir = path.resolve('./public/recipes');
    const files = fs.readdirSync(recipesDir);
    
    let totalRecipes = 0;
    let newRecipes = 0;
    let updatedRecipes = 0;
    let skippedRecipes = 0;
    let deletedRecipes = 0;
    let keptRecipes = 0;

    // Sběr všech receptů z JSON souborů pro porovnání
    const jsonRecipes = new Map(); // category -> Set of slugs

    for (const file of files) {
      if (file.endsWith('.json')) {
        const category = file.replace('.json', '');
        const filePath = path.join(recipesDir, file);
        const recipes = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`\n📁 Zpracovávám kategorii: ${category} (${recipes.length} receptů)`);

        // Inicializace Set pro tuto kategorii
        if (!jsonRecipes.has(category)) {
          jsonRecipes.set(category, new Set());
        }

        for (const recipe of recipes) {
          totalRecipes++;
          
          try {
            const slug = generateSlug(recipe.title);
            
            // Přidáme slug do Set pro tuto kategorii
            jsonRecipes.get(category).add(slug);
            
            // Zkontrolujeme, zda recept už existuje
            const existingRecipe = await pool.query(
              'SELECT id FROM recipes WHERE slug = $1 AND category = $2',
              [slug, category]
            );

            if (existingRecipe.rows.length > 0) {
              // Recept existuje - aktualizujeme ho
              await pool.query(
                `UPDATE recipes SET 
                  title = $1, 
                  description = $2, 
                  ingredients = $3, 
                  instructions = $4, 
                  image = $5,
                  time = $6,
                  difficulty = $7,
                  portion = $8
                WHERE slug = $9 AND category = $10`,
                [
                  recipe.title,
                  recipe.description,
                  JSON.stringify(recipe.ingredients),
                  JSON.stringify(recipe.instructions),
                  recipe.image,
                  recipe.time || 30,
                  recipe.difficulty || 2,
                  recipe.portion || 4,
                  slug,
                  category
                ]
              );
              updatedRecipes++;
              console.log(`  🔄 Aktualizován: ${recipe.title}`);
            } else {
              // Nový recept - vložíme ho
              await pool.query(
                `INSERT INTO recipes (
                  title, description, ingredients, instructions, 
                  image, time, difficulty, portion, 
                  category, slug
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                  recipe.title,
                  recipe.description,
                  JSON.stringify(recipe.ingredients),
                  JSON.stringify(recipe.instructions),
                  recipe.image,
                  recipe.time || 30,
                  recipe.difficulty || 2,
                  recipe.portion || 4,
                  category,
                  slug
                ]
              );
              newRecipes++;
              console.log(`  ➕ Nový: ${recipe.title}`);
            }
          } catch (error) {
            console.log(`  ❌ Chyba při zpracování ${recipe.title}: ${error.message}`);
            skippedRecipes++;
          }
        }
      }
    }

    // Smazání receptů, které už nejsou v JSON souborech
    console.log('\n🗑️  Kontroluji recepty k smazání...');
    
    for (const [category, jsonSlugs] of jsonRecipes) {
      // Získáme všechny recepty z databáze pro tuto kategorii
      const dbRecipes = await pool.query(
        'SELECT slug, title FROM recipes WHERE category = $1',
        [category]
      );
      
      for (const dbRecipe of dbRecipes.rows) {
        const dbSlug = dbRecipe.slug;
        
        // Pokud slug není v JSON souborech, zeptáme se na smazání
        if (!jsonSlugs.has(dbSlug)) {
          const answer = await askQuestion(
            `\n❓ Chcete smazat recept "${dbRecipe.title}" (${dbSlug}) z kategorie "${category}"? [ano/ne]: `
          );
          
          if (answer === 'ano' || answer === 'a' || answer === 'y' || answer === 'yes') {
            await pool.query(
              'DELETE FROM recipes WHERE slug = $1 AND category = $2',
              [dbSlug, category]
            );
            deletedRecipes++;
            console.log(`  🗑️  Smazán: ${dbRecipe.title} (${dbSlug})`);
          } else {
            keptRecipes++;
            console.log(`  ⏭️  Ponechán: ${dbRecipe.title} (${dbSlug})`);
          }
        }
      }
    }

    console.log('\n============================================================');
    console.log('🌱 SEEDOVÁNÍ DATABÁZE DOKONČENO');
    console.log('============================================================');
    console.log(`📊 Celkem zpracováno: ${totalRecipes} receptů`);
    console.log(`➕ Nových receptů: ${newRecipes}`);
    console.log(`🔄 Aktualizováno: ${updatedRecipes} receptů`);
    console.log(`🗑️  Smazáno: ${deletedRecipes} receptů`);
    console.log(`💾 Ponecháno: ${keptRecipes} receptů`);
    console.log(`⏭️  Přeskočeno: ${skippedRecipes} receptů`);
    console.log('============================================================');

  } catch (error) {
    console.error('❌ Chyba při seedování databáze:', error);
  } finally {
    rl.close();
    await pool.end();
  }
}

seed();
