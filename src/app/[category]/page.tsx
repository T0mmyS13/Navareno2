// src/app/[category]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Rating,
    Box,
    Chip,
    Stack,
    CardActionArea
} from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { motion } from "framer-motion";

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
    rating_count?: number;
    rating_sum?: number;
    [key: string]: string | number | string[] | number[] | undefined;
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
        const sortedArray = [...recipes];
        if (sortCriteria === "rating") {
            sortedArray.sort((a, b) => {
                const aAvg = a.rating_count && a.rating_count > 0 ? (a.rating_sum || 0) / a.rating_count : 0;
                const bAvg = b.rating_count && b.rating_count > 0 ? (b.rating_sum || 0) / b.rating_count : 0;
                return bAvg - aAvg;
            });
        } else if (sortCriteria === "difficulty") {
            sortedArray.sort((a, b) => a.difficulty - b.difficulty);
        } else if (sortCriteria === "time") {
            sortedArray.sort((a, b) => a.time - b.time);
        } else if (sortCriteria === "title") {
            sortedArray.sort((a, b) => a.title.localeCompare(b.title, "cs", { sensitivity: "base" }));
        }
        return sortedArray;
    }, [recipes, sortCriteria]);

    // Funkce pro náhodné přesměrování na detail náhodného receptu
    const handleRandomRecipe = () => {
        if (sortedRecipes.length > 0) {
            const randomRecipe = sortedRecipes[Math.floor(Math.random() * sortedRecipes.length)];
            router.push(`/${category}/${randomRecipe.slug}`);
        }
    };

    // Helper function to render difficulty level
    const getDifficultyText = (level: number): string => {
        switch(level) {
            case 1: return "Snadné";
            case 2: return "Střední";
            case 3: return "Náročné";
            default: return "Neznámá obtížnost";
        }
    };

    return (
        <div className="p-3 sm:p-4 md:p-5 max-w-7xl mx-auto">
            {/* Hlavni obrazek - hero sekce */}
            <div className="relative w-full h-48 sm:h-64 md:h-[350px] lg:h-[450px] overflow-hidden rounded-lg mb-5 shadow-lg">
                <Image
                    src={`/images/${category}.jpg`}
                    alt={categoryTitles[category] || category}
                    fill
                    priority
                    className="object-cover brightness-[60%]"
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white bg-black/60 px-3 py-4 sm:px-6 sm:py-6 md:p-8 rounded-lg w-[90%] max-w-2xl">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{categoryTitles[category] || category}</h1>
                    <p className="text-base sm:text-lg mt-2 first-letter:uppercase">
                        objevte nejlepší recepty v kategorii {categoryTitles[category] || category}
                    </p>
                </div>
            </div>

            {/* Ovládací prvky (zpět, náhodný recept, řazení) */}
            <div className="mb-5">
                {/* Mobil: vše na jednom řádku, desktop: tři tlačítka symetricky */}
                <div className="flex flex-row items-center justify-between gap-2 w-full sm:hidden">
                    <Link
                        href="/"
                        className="flex items-center justify-center border border-gray-400 text-gray-700 hover:bg-gray-100 rounded-xl p-2 w-10 h-10"
                        aria-label="Zpět na hlavní stránku"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <motion.button
                        animate={{
                            scale: [1, 1.06, 1],
                            boxShadow: [
                                "0 0 0 0 #90caf9, 0 0 0 0 #42a5f5",
                                "0 0 0 8px #90caf9, 0 0 32px 8px #42a5f5",
                                "0 0 0 0 #90caf9, 0 0 0 0 #42a5f5"
                            ],
                            y: [0, -4, 0, 4, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{ scale: 1.09, boxShadow: "0 0 0 10px #42a5f5, 0 0 40px 10px #1976d2" }}
                        whileTap={{ scale: 0.97 }}
                        className="relative z-10 px-2 py-1 bg-gradient-to-r from-blue-100 via-white/80 to-blue-50 backdrop-blur-md text-blue-700 font-bold rounded-lg shadow-xl text-sm focus:outline-none border border-white/40 transition-all duration-300 overflow-hidden cursor-pointer min-w-[70px] text-center"
                        style={{ boxShadow: "0 2px 12px 0 rgba(31, 38, 135, 0.13)", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
                        onClick={handleRandomRecipe}
                        type="button"
                    >
                        <span className="absolute left-0 top-0 w-full h-full pointer-events-none z-0">
                            <motion.span
                                animate={{ opacity: [0.2, 0.5, 0.2], x: [0, 80, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="block w-1/4 h-full bg-gradient-to-r from-blue-300 via-blue-100 to-transparent blur-lg opacity-60 rotate-3"
                            />
                        </span>
                        <span className="relative z-10">Nevím co si dám</span>
                    </motion.button>
                    <select
                        onChange={(e) => setSortCriteria(e.target.value)}
                        className="border border-gray-400 rounded-xl p-2 text-gray-700 text-sm min-w-[70px]"
                        value={sortCriteria}
                    >
                        <option value="">Seřadit podle</option>
                        <option value="title">Název</option>
                        <option value="difficulty">Náročnost</option>
                        <option value="time">Čas</option>
                        <option value="rating">Hodnocení</option>
                    </select>
                </div>
                {/* Desktop: tři tlačítka symetricky rozložené */}
                <div className="hidden sm:flex relative items-center w-full min-h-[48px]">
                    <div className="flex-1 flex justify-start">
                        <Link
                            href="/"
                            className="flex items-center border border-gray-400 text-gray-700 hover:bg-gray-100 rounded-xl px-3 py-2 min-w-[44px] max-w-[250px] text-base"
                            aria-label="Zpět na hlavní stránku"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            <span className="hidden md:inline">Zpět na hlavní stránku</span>
                        </Link>
                    </div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
                        <motion.button
                            animate={{
                                scale: [1, 1.06, 1],
                                boxShadow: [
                                    "0 0 0 0 #90caf9, 0 0 0 0 #42a5f5",
                                    "0 0 0 8px #90caf9, 0 0 32px 8px #42a5f5",
                                    "0 0 0 0 #90caf9, 0 0 0 0 #42a5f5"
                                ],
                                y: [0, -4, 0, 4, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            whileHover={{ scale: 1.09, boxShadow: "0 0 0 10px #42a5f5, 0 0 40px 10px #1976d2" }}
                            whileTap={{ scale: 0.97 }}
                            className="relative z-10 px-6 py-2 bg-gradient-to-r from-blue-100 via-white/80 to-blue-50 backdrop-blur-md text-blue-700 font-bold rounded-lg shadow-xl text-base focus:outline-none border border-white/40 transition-all duration-300 overflow-hidden cursor-pointer min-w-[150px] text-center"
                            style={{ boxShadow: "0 2px 12px 0 rgba(31, 38, 135, 0.13)", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
                            onClick={handleRandomRecipe}
                            type="button"
                        >
                            <span className="absolute left-0 top-0 w-full h-full pointer-events-none z-0">
                                <motion.span
                                    animate={{ opacity: [0.2, 0.5, 0.2], x: [0, 80, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="block w-1/4 h-full bg-gradient-to-r from-blue-300 via-blue-100 to-transparent blur-lg opacity-60 rotate-3"
                                />
                            </span>
                            <span className="relative z-10">Nevím co si dám</span>
                        </motion.button>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <select
                            onChange={(e) => setSortCriteria(e.target.value)}
                            className="border border-gray-400 rounded-xl px-3 py-2 text-gray-700 text-base min-w-[120px] max-w-[180px]"
                            value={sortCriteria}
                        >
                            <option value="">Seřadit podle</option>
                            <option value="title">Název</option>
                            <option value="difficulty">Náročnost</option>
                            <option value="time">Čas</option>
                            <option value="rating">Hodnocení</option>
                        </select>
                    </div>
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

            {/* Výpis receptů pomocí MUI komponent */}
            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-2 sm:p-4 md:p-5 bg-white rounded-lg shadow-md">
                    {sortedRecipes.length > 0 ? (
                        sortedRecipes.map((recipe) => (
                            <motion.div
                                key={recipe.title}
                                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(33, 150, 243, 0.18)", y: -6 }}
                                whileTap={{ scale: 0.98 }}
                                className="transition-all duration-300"
                            >
                                <Card
                                    sx={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '1.5rem', boxShadow: '0 4px 24px 0 rgba(33,150,243,0.08)' }}
                                    elevation={0}
                                    className="overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-100 hover:border-blue-300"
                                >
                                    <CardActionArea
                                        onClick={() => router.push(`/${category}/${recipe.slug}`)}
                                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}
                                    >
                                        <div className="relative w-full aspect-[4/3] overflow-hidden" style={{minHeight: '160px', maxHeight: '210px'}}>
                                            <CardMedia
                                                component="img"
                                                image={recipe.image}
                                                alt={recipe.title}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}
                                                className="group-hover:scale-105"
                                            />
                                            <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md flex items-center gap-1">
                                                <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                                <span>{recipe.time} min</span>
                                            </div>
                                        </div>
                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                                            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: '#1565c0' }}>
                                                {recipe.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                                                {recipe.description}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <Chip
                                                    icon={<FitnessCenterIcon sx={{ color: '#1976d2' }} />}
                                                    label={getDifficultyText(recipe.difficulty)}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ borderColor: '#90caf9', color: '#1976d2', background: '#e3f2fd' }}
                                                />
                                                <Box display="flex" alignItems="center" ml={0.5}>
                                                    <Rating
                                                        value={Number(recipe.rating_count) && Number(recipe.rating_sum) ? Number(recipe.rating_sum) / Number(recipe.rating_count) : 0}
                                                        precision={0.5}
                                                        readOnly
                                                        size="small"
                                                        sx={{ color: '#ffd600', fontSize: { xs: 18, sm: 20 } }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, minWidth: 32 }}>
                                                        ({recipe.rating_count || 0}x)
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </motion.div>
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