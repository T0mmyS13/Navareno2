// src/app/[category]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Food from "@/components/Food";

// Definujeme typy pro recepty
interface Recipe {
  title: string;
  image: string;
  difficulty: number;
  time: number;
  rating: string | number;
  ratingsCount: number;
  description: string;
  ingredients: string[];
  instructions: string[];
  portion: number | string;
  [key: string]: any;
}

// Typy pro categories
interface CategoryTitles {
  [key: string]: string;
}

// Komponenta pro stránku konkrétní kategorie receptů
export default function CategoryPage() {
    // Získání názvu kategorie z URL
    const params = useParams();
    const category = params.category as string;
    const router = useRouter();

    // Stav pro seznam receptů
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    // Stav pro indikaci načítání
    const [loading, setLoading] = useState(true);
    // Stav pro případnou chybu
    const [error, setError] = useState<string | null>(null);

    // Stav pro aktuálně vybrané kritérium řazení
    const [sortCriteria, setSortCriteria] = useState("");

    // Slovník pro překlad slugů kategorií na hezké názvy
    const categoryTitles: CategoryTitles = {
        "predkrmy": "Předkrmy",
        "polevky": "Polévky",
        "salaty": "Saláty",
        "hlavni-chody": "Hlavní chody",
        "dezerty": "Dezerty",
        "napoje": "Nápoje",
    };

    // Načítání receptů z databáze při změně kategorie
    useEffect(() => {
        async function fetchRecipes() {
            setLoading(true);
            setError(null);
            
            try {
                // API endpoint pro načtení receptů podle kategorie
                const response = await fetch(`/api/recipes?category=${category}`);
                
                if (!response.ok) {
                    throw new Error(`Nepodařilo se načíst recepty: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                setRecipes(data);
            } catch (err) {
                console.error("Chyba při načítání receptů:", err);
                setError("Nepodařilo se načíst recepty. Zkuste to prosím později.");
            } finally {
                setLoading(false);
            }
        }
        
        fetchRecipes();
    }, [category]);

    // Vytvoření seřazeného seznamu receptů na základě zvoleného kritéria
    const sortedRecipes = React.useMemo(() => {
        let sortedArray = [...recipes];
        if (sortCriteria === "rating") {
            sortedArray.sort((a, b) => parseFloat(String(b.rating)) - parseFloat(String(a.rating)));
        } else if (sortCriteria === "difficulty") {
            sortedArray.sort((a, b) => a.difficulty - b.difficulty);
        } else if (sortCriteria === "time") {
            sortedArray.sort((a, b) => a.time - b.time);
        }
        return sortedArray;
    }, [recipes, sortCriteria]);

    // Funkce pro náhodné přesměrování na detail náhodného receptu
    const handleRandomRecipe = () => {
        if (sortedRecipes.length > 0) {
            const randomRecipe = sortedRecipes[Math.floor(Math.random() * sortedRecipes.length)];
            router.push(`/${category}/${randomRecipe.title.toLowerCase()}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hlavni obrazek */}
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
                <Image
                    src={`/images/${category}.jpg`}
                    alt={categoryTitles[category] || category}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="text-4xl font-bold drop-shadow-md">{categoryTitles[category] || category}</h1>
                    <p className="text-lg mt-2 drop-shadow-sm">
                        Objevte nejlepší recepty v kategorii {categoryTitles[category] || category}
                    </p>
                </div>
            </div>

            {/* Ovládací prvky (zpět, náhodný recept, řazení) */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <Link href="/" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    Zpět na hlavní stránku
                </Link>
                <button
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                    onClick={handleRandomRecipe}
                    disabled={loading || sortedRecipes.length === 0}
                >
                    Nevím, co si dám
                </button>
                <div className="w-full sm:w-auto">
                    <select
                        onChange={(e) => setSortCriteria(e.target.value)}
                        value={sortCriteria}
                        className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={loading}
                    >
                        <option value="">Seřadit podle</option>
                        <option value="difficulty">Obtížnost</option>
                        <option value="time">Délka přípravy</option>
                        <option value="rating">Hodnocení</option>
                    </select>
                </div>
            </div>

            {/* Zpráva o načítání nebo chybě */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
                    <p>Načítám recepty...</p>
                </div>
            )}
            
            {error && (
                <div className="text-center py-8 text-red-600">
                    <p>{error}</p>
                </div>
            )}

            {/* Výpis receptů */}
            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedRecipes.length > 0 ? (
                        sortedRecipes.map((recipe) => (
                            <Food
                                key={recipe.title}
                                {...recipe}
                                category={category}
                                rating={recipe.rating}
                                ratingsCount={recipe.ratingsCount}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p>V této kategorii zatím nejsou žádné recepty.</p>
                            <Link 
                                href="/new-recipe" 
                                className="mt-4 inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition"
                            >
                                Přidat nový recept
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}