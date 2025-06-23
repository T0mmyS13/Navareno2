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
            router.push(`/${category}/${encodeURIComponent(randomRecipe.title)}`);
        }
    };

    return (
        <div className="p-5 max-w-7xl mx-auto">
            {/* Hlavni obrazek - hero sekce */}
            <div className="relative w-full h-[450px] overflow-hidden rounded-lg mb-5 shadow-lg">
                <Image
                    src={`/images/${category}.jpg`}
                    alt={categoryTitles[category] || category}
                    fill
                    priority
                    className="object-cover brightness-[60%]" 
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white bg-black/60 p-8 rounded-lg">
                    <h1 className="text-4xl font-bold">{categoryTitles[category] || category}</h1>
                    <p className="text-lg mt-2 first-letter:uppercase">
                        objevte nejlepší recepty v kategorii {categoryTitles[category] || category}
                    </p>
                </div>
            </div>

            {/* Ovládací prvky (zpět, náhodný recept, řazení) */}
            <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
                <Link 
                    href="/" 
                    className="bg-[#ff5e57] hover:bg-[#e04e47] text-white py-2.5 px-5 border-none rounded-lg text-base cursor-pointer transition-all duration-300 no-underline"
                >
                    Zpět na hlavní stránku
                </Link>
                
                <button
                    className="bg-[#4caf50] hover:bg-[#388e3c] text-white py-3 px-6 border-none rounded-full text-lg font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 animate-[bounce_4s_ease-in-out_infinite] active:scale-95"
                    onClick={handleRandomRecipe}
                    disabled={loading || sortedRecipes.length === 0}
                >
                    Nevím, co si dám
                </button>
                
                <div className="sort-filter">
                    <select
                        onChange={(e) => setSortCriteria(e.target.value)}
                        value={sortCriteria}
                        className="py-2.5 px-5 text-base rounded-lg border border-gray-300 bg-white cursor-pointer"
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
                <div className="grid grid-cols-3 gap-5 p-5 bg-white rounded-lg shadow-md md:grid-cols-2 sm:grid-cols-1">
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