"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Card, CardContent, CardMedia, Typography, Rating, Box, Chip, Stack, CardActionArea } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Search, Plus, X } from "lucide-react";

interface Recipe {
    title: string;
    image: string;
    difficulty: number;
    time: number;
    rating: string | number;
    ratingsCount: number;
    description: string;
    ingredients: Array<{ name: string; quantity: number; unit: string }>;
    instructions: string[];
    portion: number | string;
    rating_count?: number;
    rating_sum?: number;
    slug: string;
    category: string;
    [key: string]: string | number | string[] | number[] | Array<{ name: string; quantity: number; unit: string }> | undefined;
}

// Separate component for search input to isolate performance issues
const SearchInput = React.memo(({ 
    onAddIngredient, 
    allIngredients, 
    selectedIngredients,
    ingredientCategories
}: {
    onAddIngredient: (ingredient: string) => void;
    allIngredients: string[];
    selectedIngredients: string[];
    ingredientCategories: { [key: string]: string[] };
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Funkce pro odstranění diakritiky
    const removeDiacritics = (str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    // Enhanced search with fuzzy matching and category-based search
    const suggestions = useMemo(() => {
        if (!showSuggestions || searchTerm.trim() === "") {
            return [];
        }

        const searchLower = searchTerm.toLowerCase();
        const searchWithoutDiacritics = removeDiacritics(searchLower);
        const results: string[] = [];
        let count = 0;
        
        // Use a more efficient search with early termination and category matching
        for (let i = 0; i < allIngredients.length && count < 15; i++) {
            const ingredient = allIngredients[i];
            
            // Skip if already selected
            if (selectedIngredients.includes(ingredient)) {
                continue;
            }
            
            let shouldInclude = false;
            
            // Direct match (with and without diacritics)
            const ingredientLower = ingredient.toLowerCase();
            const ingredientWithoutDiacritics = removeDiacritics(ingredientLower);
            
            if (ingredientLower.includes(searchLower) || 
                ingredientWithoutDiacritics.includes(searchWithoutDiacritics)) {
                shouldInclude = true;
            }
            // Category-based matching
            else {
                for (const [category, items] of Object.entries(ingredientCategories)) {
                    const categoryLower = category.toLowerCase();
                    const categoryWithoutDiacritics = removeDiacritics(categoryLower);
                    
                    if (categoryLower.includes(searchLower) || 
                        categoryWithoutDiacritics.includes(searchWithoutDiacritics) ||
                        searchLower.includes(categoryLower) || 
                        searchWithoutDiacritics.includes(categoryWithoutDiacritics)) {
                        
                        if (items.some(item => {
                            const itemLower = item.toLowerCase();
                            const itemWithoutDiacritics = removeDiacritics(itemLower);
                            return ingredientLower.includes(itemLower) || 
                                   itemLower.includes(ingredientLower) ||
                                   ingredientWithoutDiacritics.includes(itemWithoutDiacritics) ||
                                   itemWithoutDiacritics.includes(ingredientWithoutDiacritics);
                        })) {
                            shouldInclude = true;
                            break;
                        }
                    }
                }
            }
            
            if (shouldInclude) {
                results.push(ingredient);
                count++;
            }
        }
        
        return results;
    }, [searchTerm, allIngredients, selectedIngredients, showSuggestions, ingredientCategories]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Show suggestions after a short delay
        if (value.trim() === "") {
            setShowSuggestions(false);
        } else {
            timeoutRef.current = setTimeout(() => {
                setShowSuggestions(true);
            }, 30); // Reduced delay for faster response
        }
    }, []);

    const handleAddIngredient = useCallback((ingredient: string) => {
        onAddIngredient(ingredient);
        setSearchTerm("");
        setShowSuggestions(false);
    }, [onAddIngredient]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                <Search className="text-gray-400 w-5 h-5 transform -translate-y-1" />
            </div>
            <input
                type="text"
                placeholder="Hledejte ingredience (např. vejce, cukr, máslo)..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />

            {/* Návrhy ingrediencí */}
            {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((ingredient, index) => (
                        <button
                            key={index}
                            onClick={() => handleAddIngredient(ingredient)}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4 text-blue-600" />
                            {ingredient}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default function FilterPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [allIngredients, setAllIngredients] = useState<string[]>([]);

    // Definice kategorií ingrediencí pro rychlé filtrování
    const ingredientCategories = useMemo((): { [key: string]: string[] } => ({
        'těstoviny': ['spaghetti', 'penne', 'farfalle', 'fusilli', 'rigatoni', 'linguine', 'tagliatelle', 'lasagne', 'ravioli', 'tortellini', 'gnocchi', 'macaroni', 'orecchiette', 'pappardelle', 'cannelloni', 'těstoviny', 'špagety', 'penne', 'farfalle', 'fusilli'],
        'rýže': ['rýže', 'basmati', 'jasmine', 'arborio', 'wild rice', 'brown rice', 'white rice', 'natural', 'parboiled'],
        'maso': ['kuřecí', 'hovězí', 'vepřové', 'jehněčí', 'krůtí', 'králičí', 'telecí', 'skopové', 'maso', 'prsa', 'steak', 'kotlety', 'mleté'],
        'ryby': ['losos', 'tuňák', 'treska', 'platýs', 'makrela', 'sardinky', 'ančovičky', 'pstruh', 'ryba', 'mořské plody', 'krevety', 'mušle'],
        'zelenina': ['mrkev', 'cibule', 'česnek', 'paprika', 'rajčata', 'okurka', 'salát', 'špenát', 'brokolice', 'květák', 'zelí', 'brambory', 'zelenina', 'cuketa', 'lilek', 'dýně', 'řepa', 'celer'],
        'sýr': ['sýr', 'parmezán', 'mozzarella', 'cheddar', 'gouda', 'feta', 'ricotta', 'cottage', 'balkánský', 'eidam', 'hermelín', 'niva', 'olomoucké tvarůžky'],
        'bylinky': ['bazalka', 'oregano', 'tymián', 'rozmarýn', 'šalvěj', 'petržel', 'kopr', 'máta', 'koriandr', 'bylinky', 'majoránka', 'libeček', 'meduňka'],
        'koření': ['pepř', 'sůl', 'paprika', 'kurkuma', 'kari', 'kardamom', 'skořice', 'muškátový oříšek', 'hřebíček', 'koření', 'kmín', 'fenykl', 'anýz', 'vanilka'],
        'ovoce': ['jablka', 'hrušky', 'banány', 'pomeranče', 'citrony', 'limetky', 'jahody', 'maliny', 'borůvky', 'ovoce', 'hroznové víno', 'kiwi', 'mango'],
        'ořechy': ['vlašské ořechy', 'mandle', 'kešu', 'lískové ořechy', 'arašídy', 'pistácie', 'ořechy', 'semínka', 'slunečnicová semínka', 'dýňová semínka'],
        'mléčné výrobky': ['mléko', 'smetana', 'jogurt', 'tvaroh', 'máslo', 'mléčné výrobky', 'kefír', 'zakysaná smetana', 'šlehačka'],
        'vejce': ['vejce', 'vajíčka', 'bílky', 'žloutky']
    }), []);

    // Načtení všech receptů
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/api/recipes');
                if (response.ok) {
                    const data = await response.json();
                    setRecipes(data);
                    
                    // Extrahování všech unikátních ingrediencí
                    const ingredients = new Set<string>();
                    data.forEach((recipe: Recipe) => {
                        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
                            recipe.ingredients.forEach((ingredient: { name: string; quantity: number; unit: string }) => {
                                ingredients.add(ingredient.name.toLowerCase().trim());
                            });
                        }
                    });
                    setAllIngredients(Array.from(ingredients).sort());
                }
            } catch (error) {
                console.error('Chyba při načítání receptů:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    const handleAddIngredient = useCallback((ingredient: string) => {
        if (!selectedIngredients.includes(ingredient)) {
            setSelectedIngredients(prev => [...prev, ingredient]);
        }
    }, [selectedIngredients]);

    const handleRemoveIngredient = useCallback((ingredient: string) => {
        setSelectedIngredients(prev => prev.filter(ing => ing !== ingredient));
    }, []);

    const handleClearAll = useCallback(() => {
        setSelectedIngredients([]);
    }, []);

    const getDifficultyText = useCallback((difficulty: number) => {
        switch (difficulty) {
            case 1: return "Snadné";
            case 2: return "Střední";
            case 3: return "Obtížné";
            default: return "Neznámé";
        }
    }, []);

    // Funkce pro odstranění diakritiky
    const removeDiacritics = useCallback((str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }, []);

    // Filtrování receptů podle vybraných ingrediencí - optimalizováno s useMemo
    const filteredRecipes = useMemo(() => {
        if (selectedIngredients.length === 0) {
            return recipes;
        }

        return recipes.filter((recipe) => {
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return false;
            
            const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase().trim());
            
            return selectedIngredients.every(selectedIng => {
                // Pokud je vybraná ingredience kategorie, hledej všechny ingredience z této kategorie
                if (ingredientCategories[selectedIng]) {
                    const categoryIngredients = ingredientCategories[selectedIng];
                    return categoryIngredients.some(categoryIng => {
                        const categoryIngLower = categoryIng.toLowerCase();
                        const categoryIngWithoutDiacritics = removeDiacritics(categoryIngLower);
                        
                        return recipeIngredients.some(recipeIng => {
                            const recipeIngWithoutDiacritics = removeDiacritics(recipeIng);
                            return recipeIng.includes(categoryIngLower) || 
                                   categoryIngLower.includes(recipeIng) ||
                                   recipeIngWithoutDiacritics.includes(categoryIngWithoutDiacritics) ||
                                   categoryIngWithoutDiacritics.includes(recipeIngWithoutDiacritics);
                        });
                    });
                }
                // Jinak hledej konkrétní ingredienci
                const selectedIngLower = selectedIng.toLowerCase();
                const selectedIngWithoutDiacritics = removeDiacritics(selectedIngLower);
                
                return recipeIngredients.some(recipeIng => {
                    const recipeIngWithoutDiacritics = removeDiacritics(recipeIng);
                    return recipeIng.includes(selectedIngLower) || 
                           selectedIngLower.includes(recipeIng) ||
                           recipeIngWithoutDiacritics.includes(selectedIngWithoutDiacritics) ||
                           selectedIngWithoutDiacritics.includes(recipeIngWithoutDiacritics);
                });
            });
        });
    }, [recipes, selectedIngredients, ingredientCategories, removeDiacritics]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Načítám recepty...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
                        Filtrování receptů podle ingrediencí
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Vyberte ingredience, které máte doma, a najdeme recepty, které můžete připravit
                    </p>
                </div>

                {/* Filtrovací sekce */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">Vyberte ingredience</h2>
                    
                    {/* Kategorie ingrediencí */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Rychlé kategorie:</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {[
                                { name: 'Těstoviny', icon: '🍝', category: 'těstoviny' },
                                { name: 'Maso', icon: '🥩', category: 'maso' },
                                { name: 'Zelenina', icon: '🥬', category: 'zelenina' },
                                { name: 'Sýr', icon: '🧀', category: 'sýr' },
                                { name: 'Rýže', icon: '🍚', category: 'rýže' },
                                { name: 'Ryby', icon: '🐟', category: 'ryby' },
                                { name: 'Bylinky', icon: '🌿', category: 'bylinky' },
                                { name: 'Koření', icon: '🧂', category: 'koření' },
                                { name: 'Ovoce', icon: '🍎', category: 'ovoce' },
                                { name: 'Ořechy', icon: '🥜', category: 'ořechy' },
                                { name: 'Mléčné výrobky', icon: '🥛', category: 'mléčné výrobky' },
                                { name: 'Vejce', icon: '🥚', category: 'vejce' }
                            ].map((cat) => (
                                <button
                                    key={cat.category}
                                    onClick={() => {
                                        // Přidat obecný název kategorie jako ingredienci
                                        if (!selectedIngredients.includes(cat.category)) {
                                            setSelectedIngredients(prev => [...prev, cat.category]);
                                        }
                                    }}
                                    className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
                                >
                                    <span className="text-2xl mb-1">{cat.icon}</span>
                                    <span className="text-xs font-medium text-blue-800 text-center">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Vyhledávání ingrediencí */}
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Nebo vyhledejte konkrétní ingredienci:</h3>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SearchInput 
                                    onAddIngredient={handleAddIngredient}
                                    allIngredients={allIngredients}
                                    selectedIngredients={selectedIngredients}
                                    ingredientCategories={ingredientCategories}
                                />
                            </div>
                            <Button
                                onClick={handleClearAll}
                                variant="outline"
                                className="px-4 flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                                Vymazat vše
                            </Button>
                        </div>
                    </div>

                    {/* Vybrané ingredience */}
                    {selectedIngredients.length > 0 && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Vybrané ingredience:</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedIngredients.map((ingredient, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        <span>{ingredient}</span>
                                        <button
                                            onClick={() => handleRemoveIngredient(ingredient)}
                                            className="hover:bg-blue-200 rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistiky */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span>Celkem receptů: {recipes.length}</span>
                        <span>Filtrované recepty: {filteredRecipes.length}</span>
                        {selectedIngredients.length > 0 && (
                            <span>Vybrané ingredience: {selectedIngredients.length}</span>
                        )}
                    </div>
                </div>

                {/* Výsledky */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6">
                        {selectedIngredients.length > 0 
                            ? `Recepty s ingrediencemi (${filteredRecipes.length})`
                            : `Všechny recepty (${filteredRecipes.length})`
                        }
                    </h2>

                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Nebyly nalezeny žádné recepty
                            </h3>
                            <p className="text-gray-500">
                                {selectedIngredients.length > 0 
                                    ? "Zkuste vybrat méně ingrediencí nebo jiné ingredience."
                                    : "Zkuste vybrat nějaké ingredience pro filtrování."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredRecipes.map((recipe, index) => (
                                <motion.div
                                    key={`${recipe.category}-${recipe.slug}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card
                                        sx={{ 
                                            maxWidth: '100%', 
                                            height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            borderRadius: '1.5rem', 
                                            boxShadow: '0 4px 24px 0 rgba(33,150,243,0.08)' 
                                        }}
                                        elevation={0}
                                        className="overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 border border-blue-100 hover:border-blue-300 group"
                                    >
                                        <CardActionArea
                                            onClick={() => window.location.href = `/${recipe.category}/${recipe.slug}`}
                                            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}
                                        >
                                            <div className="relative">
                                                <CardMedia
                                                    component="img"
                                                    image={recipe.image}
                                                    alt={recipe.title}
                                                    sx={{ 
                                                        width: '100%', 
                                                        height: '200px', 
                                                        objectFit: 'cover', 
                                                        transition: 'transform 0.4s', 
                                                        borderTopLeftRadius: '1.5rem', 
                                                        borderTopRightRadius: '1.5rem' 
                                                    }}
                                                    className="group-hover:scale-105"
                                                />
                                                <div className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur-md flex items-center gap-1">
                                                    <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                                                    <span>{recipe.time} min</span>
                                                </div>
                                            </div>
                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                                <Typography 
                                                    gutterBottom 
                                                    variant="h6" 
                                                    component="div" 
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        fontSize: { xs: '1.1rem', sm: '1.25rem' }, 
                                                        color: '#1565c0' 
                                                    }}
                                                >
                                                    {recipe.title}
                                                </Typography>
                                                <Typography 
                                                    variant="body2" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        mb: 2, 
                                                        flexGrow: 1, 
                                                        display: '-webkit-box', 
                                                        WebkitBoxOrient: 'vertical', 
                                                        WebkitLineClamp: 3, 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        fontSize: { xs: '0.95rem', sm: '1.05rem' } 
                                                    }}
                                                >
                                                    {recipe.description}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
