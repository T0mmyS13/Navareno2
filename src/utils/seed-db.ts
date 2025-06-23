// src/utils/seed-db.ts
import { sql } from './db';

async function seed() {
    try {
        // Vytvoření tabulky receptů
        await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        time INTEGER,
        difficulty INTEGER,
        portion INTEGER,
        rating DECIMAL(3,1) DEFAULT 0,
        ratingsCount INTEGER DEFAULT 0,
        ingredients JSONB,
        instructions JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        console.log('Tabulka receptů byla vytvořena nebo již existuje');

        // Zde můžete přidat nějaké testovací recepty, pokud chcete

    } catch (error) {
        console.error('Chyba při seedování databáze:', error);
    }
}

// Spuštění seedovacího skriptu
seed();