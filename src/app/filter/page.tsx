"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui";
import { Search, Plus, X, Utensils, Beef, Fish, Carrot, Leaf, Apple, Nut, Milk, Egg, Bean, Droplets, Coffee, Wine, Wheat, Flame } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";

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
    const [selectedIngredients, setSelectedIngredients] = useState<{ name: string; mode: 'include' | 'exclude' }[]>([]);
    const [allIngredients, setAllIngredients] = useState<string[]>([]);
    const [showAllIngredientsModal, setShowAllIngredientsModal] = useState(false);
    const [vegetarianOnly, setVegetarianOnly] = useState(false);
    const [defaultMode, setDefaultMode] = useState<'include' | 'exclude'>('include');

    // Kombinovaný systém ikonek - emoji + Lucide ikony pro lepší vizuální efekt
    const ingredientIconMap = useMemo((): { [key: string]: React.ReactNode } => ({
        // Těstoviny a obiloviny - kombinace emoji a ikon
        'těstoviny': <span className="text-2xl">🍝</span>, 'spaghetti': <span className="text-2xl">🍝</span>, 'špagety': <span className="text-2xl">🍝</span>, 'penne': <span className="text-2xl">🍝</span>, 'farfalle': <span className="text-2xl">🍝</span>, 'fusilli': <span className="text-2xl">🍝</span>, 'rigatoni': <span className="text-2xl">🍝</span>, 'linguine': <span className="text-2xl">🍝</span>, 'tagliatelle': <span className="text-2xl">🍝</span>, 'lasagne': <span className="text-2xl">🍝</span>, 'ravioli': <span className="text-2xl">🍝</span>, 'tortellini': <span className="text-2xl">🍝</span>, 'gnocchi': <span className="text-2xl">🍝</span>, 'macaroni': <span className="text-2xl">🍝</span>, 'orecchiette': <span className="text-2xl">🍝</span>, 'pappardelle': <span className="text-2xl">🍝</span>, 'cannelloni': <span className="text-2xl">🍝</span>,
        'rýže': <span className="text-2xl">🍚</span>, 'basmati': <span className="text-2xl">🍚</span>, 'jasmine': <span className="text-2xl">🍚</span>, 'arborio': <span className="text-2xl">🍚</span>, 'natural rýže': <span className="text-2xl">🍚</span>,
        'chléb': <span className="text-2xl">🍞</span>, 'rohlík': <span className="text-2xl">🥖</span>, 'bageta': <span className="text-2xl">🥖</span>, 'toustový chléb': <span className="text-2xl">🍞</span>, 'celozrnný chléb': <span className="text-2xl">🍞</span>,
        'mouka': <Wheat className="w-6 h-6 text-amber-600" />, 'pšeničná mouka': <Wheat className="w-6 h-6 text-amber-600" />, 'žitná mouka': <Wheat className="w-6 h-6 text-amber-600" />, 'špaldová mouka': <Wheat className="w-6 h-6 text-amber-600" />, 'kukuřičná mouka': <Wheat className="w-6 h-6 text-amber-600" />,
        
        // Maso - kombinace emoji a ikon
        'maso': <Beef className="w-6 h-6 text-red-600" />, 'kuřecí': <span className="text-2xl">🍗</span>, 'kuře': <span className="text-2xl">🍗</span>, 'hovězí': <Beef className="w-6 h-6 text-red-600" />, 'vepřové': <Beef className="w-6 h-6 text-red-600" />, 'vepř': <Beef className="w-6 h-6 text-red-600" />, 'jehněčí': <Beef className="w-6 h-6 text-red-600" />, 'krůtí': <span className="text-2xl">🍗</span>, 'krůta': <span className="text-2xl">🍗</span>, 'králičí': <Beef className="w-6 h-6 text-red-600" />, 'telecí': <Beef className="w-6 h-6 text-red-600" />, 'skopové': <Beef className="w-6 h-6 text-red-600" />, 'steak': <Beef className="w-6 h-6 text-red-600" />, 'kotlety': <Beef className="w-6 h-6 text-red-600" />, 'mleté': <Beef className="w-6 h-6 text-red-600" />, 'klobása': <span className="text-2xl">🌭</span>, 'salám': <span className="text-2xl">🌭</span>, 'šunka': <span className="text-2xl">🥓</span>, 'slanina': <span className="text-2xl">🥓</span>, 'kachní': <span className="text-2xl">🦆</span>, 'kachna': <span className="text-2xl">🦆</span>, 'kachní maso': <span className="text-2xl">🦆</span>, 'kachní prsa': <span className="text-2xl">🦆</span>, 'kachní stehno': <span className="text-2xl">🦆</span>,
        
        // Ryby a mořské plody - kombinace emoji a ikon
        'ryby': <Fish className="w-6 h-6 text-blue-600" />,'mořské plody': <Fish className="w-6 h-6 text-blue-600" />, 'losos': <Fish className="w-6 h-6 text-blue-600" />, 'tuňák': <Fish className="w-6 h-6 text-blue-600" />, 'treska': <Fish className="w-6 h-6 text-blue-600" />, 'platýs': <Fish className="w-6 h-6 text-blue-600" />, 'makrela': <Fish className="w-6 h-6 text-blue-600" />, 'sardinky': <Fish className="w-6 h-6 text-blue-600" />, 'ančovičky': <Fish className="w-6 h-6 text-blue-600" />, 'pstruh': <Fish className="w-6 h-6 text-blue-600" />, 'krevety': <span className="text-2xl">🦐</span>, 'mušle': <span className="text-2xl">🦪</span>, 'ústřice': <span className="text-2xl">🦪</span>, 'chobotnice': <span className="text-2xl">🐙</span>, 'kalamáry': <span className="text-2xl">🦑</span>,
        
        // Zelenina - kombinace emoji a ikon
        'zelenina': <Carrot className="w-6 h-6 text-orange-500" />, 'mrkev': <Carrot className="w-6 h-6 text-orange-500" />, 'cibule': <span className="text-2xl">🧅</span>, 'česnek': <span className="text-2xl">🧄</span>, 'paprika': <span className="text-2xl">🫑</span>, 'rajčata': <span className="text-2xl">🍅</span>, 'rajče': <span className="text-2xl">🍅</span>, 'okurka': <span className="text-2xl">🥒</span>, 'salát': <Leaf className="w-6 h-6 text-green-600" />, 'špenát': <Leaf className="w-6 h-6 text-green-600" />, 'brokolice': <span className="text-2xl">🥦</span>, 'květák': <span className="text-2xl">🥦</span>, 'zelí': <Leaf className="w-6 h-6 text-green-600" />, 'brambory': <span className="text-2xl">🥔</span>, 'brambor': <span className="text-2xl">🥔</span>, 'cuketa': <span className="text-2xl">🥒</span>, 'lilek': <span className="text-2xl">🍆</span>, 'dýně': <span className="text-2xl">🎃</span>, 'řepa': <span className="text-2xl">🥕</span>, 'celer': <Leaf className="w-6 h-6 text-green-600" />, 'petržel': <Leaf className="w-6 h-6 text-green-600" />, 'koriandr': <Leaf className="w-6 h-6 text-green-600" />, 'kopr': <Leaf className="w-6 h-6 text-green-600" />, 'máta': <Leaf className="w-6 h-6 text-green-600" />, 'bazalka': <Leaf className="w-6 h-6 text-green-600" />,'oregano': <Leaf className="w-6 h-6 text-green-600" />, 'tymián': <Leaf className="w-6 h-6 text-green-600" />, 'rozmarýn': <Leaf className="w-6 h-6 text-green-600" />, 'šalvěj': <Leaf className="w-6 h-6 text-green-600" />, 'majoránka': <Leaf className="w-6 h-6 text-green-600" />, 'libeček': <Leaf className="w-6 h-6 text-green-600" />, 'meduňka': <Leaf className="w-6 h-6 text-green-600" />,
        
        // Sýry a mléčné výrobky - kombinace emoji a ikon
        'sýr': <span className="text-2xl">🧀</span>, 'parmezán': <span className="text-2xl">🧀</span>, 'mozzarella': <span className="text-2xl">🧀</span>, 'cheddar': <span className="text-2xl">🧀</span>, 'gouda': <span className="text-2xl">🧀</span>, 'feta': <span className="text-2xl">🧀</span>, 'ricotta': <span className="text-2xl">🧀</span>, 'cottage': <span className="text-2xl">🧀</span>, 'balkánský': <span className="text-2xl">🧀</span>, 'eidam': <span className="text-2xl">🧀</span>, 'hermelín': <span className="text-2xl">🧀</span>, 'niva': <span className="text-2xl">🧀</span>, 'olomoucké tvarůžky': <span className="text-2xl">🧀</span>, 'camembert': <span className="text-2xl">🧀</span>, 'brie': <span className="text-2xl">🧀</span>, 'roquefort': <span className="text-2xl">🧀</span>, 'gorgonzola': <span className="text-2xl">🧀</span>,
        'mléčné výrobky': <Milk className="w-6 h-6 text-blue-200" />, 'mléko': <Milk className="w-6 h-6 text-blue-200" />, 'smetana': <Milk className="w-6 h-6 text-blue-200" />, 'jogurt': <Milk className="w-6 h-6 text-blue-200" />, 'tvaroh': <span className="text-2xl">🧀</span>, 'kefír': <Milk className="w-6 h-6 text-blue-200" />, 'zakysaná smetana': <Milk className="w-6 h-6 text-blue-200" />, 'šlehačka': <Milk className="w-6 h-6 text-blue-200" />, 'máslo': <span className="text-2xl">🧈</span>, 'kysaná smetana': <Milk className="w-6 h-6 text-blue-200" />,
        
        // Koření a ochucovadla - kombinace emoji a ikon
        'koření': <Flame className="w-6 h-6 text-red-500" />, 'pepř': <span className="text-2xl">🌶️</span>, 'sůl': <span className="text-2xl">🧂</span>, 'kurkuma': <span className="text-2xl">🟡</span>, 'kari': <span className="text-2xl">🟡</span>, 'kardamom': <span className="text-2xl">🟤</span>, 'skořice': <span className="text-2xl">🟤</span>, 'kmín': <span className="text-2xl">🟤</span>, 'fenykl': <span className="text-2xl">🌿</span>, 'anýz': <span className="text-2xl">🌿</span>, 'vanilka': <span className="text-2xl">🟤</span>, 'muškátový oříšek': <span className="text-2xl">🟤</span>, 'hřebíček': <span className="text-2xl">🟤</span>, 'bobkový list': <span className="text-2xl">🌿</span>, 'nové koření': <span className="text-2xl">🟤</span>, 'zázvor': <span className="text-2xl">🟡</span>, 'chilli': <Flame className="w-6 h-6 text-red-500" />, 'kajenský pepř': <Flame className="w-6 h-6 text-red-500" />,
        
        // Ovoce - kombinace emoji a ikon
        'ovoce': <Apple className="w-6 h-6 text-red-500" />, 'jablka': <Apple className="w-6 h-6 text-red-500" />, 'jablko': <Apple className="w-6 h-6 text-red-500" />, 'hrušky': <span className="text-2xl">🍐</span>, 'hruška': <span className="text-2xl">🍐</span>, 'banány': <span className="text-2xl">🍌</span>, 'banán': <span className="text-2xl">🍌</span>, 'pomeranče': <span className="text-2xl">🍊</span>, 'pomeranč': <span className="text-2xl">🍊</span>, 'citrony': <span className="text-2xl">🍋</span>, 'citron': <span className="text-2xl">🍋</span>, 'limetky': <span className="text-2xl">🍋</span>, 'limetka': <span className="text-2xl">🍋</span>, 'jahody': <span className="text-2xl">🍓</span>, 'jahoda': <span className="text-2xl">🍓</span>, 'maliny': <span className="text-2xl">🫐</span>, 'malina': <span className="text-2xl">🍓</span>, 'borůvky': <span className="text-2xl">🫐</span>, 'borůvka': <span className="text-2xl">🫐</span>, 'hroznové víno': <span className="text-2xl">🍇</span>, 'hrozny': <span className="text-2xl">🍇</span>, 'kiwi': <span className="text-2xl">🥝</span>, 'mango': <span className="text-2xl">🥭</span>, 'ananas': <span className="text-2xl">🍍</span>, 'broskve': <span className="text-2xl">🍑</span>, 'broskvička': <span className="text-2xl">🍑</span>, 'meruňky': <span className="text-2xl">🍑</span>, 'meruňka': <span className="text-2xl">🍑</span>, 'švestky': <span className="text-2xl">🫐</span>, 'švestka': <span className="text-2xl">🫐</span>, 'třešně': <span className="text-2xl">🍒</span>, 'třešeň': <span className="text-2xl">🍒</span>, 'višně': <span className="text-2xl">🍒</span>, 'višeň': <span className="text-2xl">🍒</span>, 'rybíz': <span className="text-2xl">🫐</span>, 'angrešt': <span className="text-2xl">🫐</span>, 'brusinky': <span className="text-2xl">🫐</span>, 'brusinka': <span className="text-2xl">🫐</span>,
        
        // Ořechy a semínka - kombinace emoji a ikon
        'ořechy': <Nut className="w-6 h-6 text-amber-700" />, 'vlašské ořechy': <Nut className="w-6 h-6 text-amber-700" />, 'mandle': <Nut className="w-6 h-6 text-amber-700" />, 'kešu': <Nut className="w-6 h-6 text-amber-700" />, 'lískové ořechy': <Nut className="w-6 h-6 text-amber-700" />, 'arašídy': <Nut className="w-6 h-6 text-amber-700" />, 'pistácie': <Nut className="w-6 h-6 text-amber-700" />, 'semínka': <span className="text-2xl">🌱</span>, 'semínko': <span className="text-2xl">🌱</span>, 'slunečnicová semínka': <span className="text-2xl">🌻</span>, 'dýňová semínka': <span className="text-2xl">🎃</span>, 'sezamová semínka': <span className="text-2xl">🌱</span>, 'lněná semínka': <span className="text-2xl">🌱</span>, 'chia semínka': <span className="text-2xl">🌱</span>, 'konopná semínka': <span className="text-2xl">🌱</span>,
        
        // Vejce - kombinace emoji a ikon
        'vejce': <Egg className="w-6 h-6 text-yellow-500" />, 'vajíčka': <Egg className="w-6 h-6 text-yellow-500" />, 'vajíčko': <Egg className="w-6 h-6 text-yellow-500" />, 'bílky': <Egg className="w-6 h-6 text-yellow-500" />, 'bílek': <Egg className="w-6 h-6 text-yellow-500" />, 'žloutky': <Egg className="w-6 h-6 text-yellow-500" />, 'žloutek': <Egg className="w-6 h-6 text-yellow-500" />,
        
        // Oleje a tuky - kombinace emoji a ikon
        'olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'olivový olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'slunečnicový olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'řepkový olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'kokosový olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'sezamový olej': <Droplets className="w-6 h-6 text-yellow-400" />, 'tuk': <Droplets className="w-6 h-6 text-yellow-400" />, 'sádlo': <Droplets className="w-6 h-6 text-yellow-400" />, 'margarín': <span className="text-2xl">🧈</span>,
        
        // Cukry a sladidla - kombinace emoji a ikon
        'cukr': <span className="text-2xl">🍯</span>, 'bílý cukr': <span className="text-2xl">🍯</span>, 'hnědý cukr': <span className="text-2xl">🍯</span>, 'třtinový cukr': <span className="text-2xl">🍯</span>, 'med': <span className="text-2xl">🍯</span>, 'javorový sirup': <span className="text-2xl">🍯</span>, 'agávový sirup': <span className="text-2xl">🍯</span>, 'stevia': <span className="text-2xl">🍯</span>, 'aspartam': <span className="text-2xl">🍯</span>, 'sacharin': <span className="text-2xl">🍯</span>,
        
        // Luštěniny - kombinace emoji a ikon
        'čočka': <Bean className="w-6 h-6 text-green-700" />, 'fazole': <Bean className="w-6 h-6 text-green-700" />, 'hrách': <Bean className="w-6 h-6 text-green-700" />, 'cizrna': <Bean className="w-6 h-6 text-green-700" />, 'sója': <Bean className="w-6 h-6 text-green-700" />, 'sójové boby': <Bean className="w-6 h-6 text-green-700" />, 'edamame': <Bean className="w-6 h-6 text-green-700" />, 'černé fazole': <Bean className="w-6 h-6 text-green-700" />, 'bílé fazole': <Bean className="w-6 h-6 text-green-700" />, 'červené fazole': <Bean className="w-6 h-6 text-green-700" />, 'adzuki fazole': <Bean className="w-6 h-6 text-green-700" />,
        
        // Houby - kombinace emoji a ikon
        'houby': <span className="text-2xl">🍄</span>, 'žampiony': <span className="text-2xl">🍄</span>, 'shiitake': <span className="text-2xl">🍄</span>, 'portobello': <span className="text-2xl">🍄</span>, 'hřib': <span className="text-2xl">🍄</span>, 'křemenáč': <span className="text-2xl">🍄</span>, 'kozák': <span className="text-2xl">🍄</span>, 'klouzek': <span className="text-2xl">🍄</span>, 'ryzec': <span className="text-2xl">🍄</span>, 'muchomůrka': <span className="text-2xl">🍄</span>, 'bedla': <span className="text-2xl">🍄</span>,
        
        // Nápoje a tekutiny - kombinace emoji a ikon
        'voda': <Droplets className="w-6 h-6 text-blue-400" />, 'vývar': <span className="text-2xl">🍲</span>, 'kuřecí vývar': <span className="text-2xl">🍲</span>, 'hovězí vývar': <span className="text-2xl">🍲</span>, 'zeleninový vývar': <span className="text-2xl">🍲</span>, 'rybí vývar': <span className="text-2xl">🍲</span>, 'džus': <span className="text-2xl">🧃</span>, 'pomerančový džus': <span className="text-2xl">🧃</span>, 'jablečný džus': <span className="text-2xl">🧃</span>, 'limonáda': <span className="text-2xl">🧃</span>, 'cola': <span className="text-2xl">🥤</span>, 'káva': <Coffee className="w-6 h-6 text-brown-600" />, 'čaj': <span className="text-2xl">🫖</span>, 'zelený čaj': <span className="text-2xl">🫖</span>, 'černý čaj': <span className="text-2xl">🫖</span>, 'bylinný čaj': <span className="text-2xl">🫖</span>, 'pivo': <span className="text-2xl">🍺</span>, 'víno': <Wine className="w-6 h-6 text-purple-600" />, 'červené víno': <Wine className="w-6 h-6 text-purple-600" />, 'bílé víno': <Wine className="w-6 h-6 text-purple-600" />, 'šampaňské': <span className="text-2xl">🍾</span>,
        
        // Omáčky a dochucovadla - kombinace emoji a ikon
        'kečup': <span className="text-2xl">🍅</span>, 'hořčice': <span className="text-2xl">🌶️</span>, 'majonéza': <span className="text-2xl">🥛</span>, 'tatarská omáčka': <span className="text-2xl">🥛</span>, 'barbecue omáčka': <span className="text-2xl">🌶️</span>, 'sojová omáčka': <span className="text-2xl">🫗</span>, 'worcestrová omáčka': <span className="text-2xl">🫗</span>, 'rybí omáčka': <span className="text-2xl">🫗</span>, 'ústřicová omáčka': <span className="text-2xl">🫗</span>, 'chilli omáčka': <span className="text-2xl">🌶️</span>, 'tabasco': <span className="text-2xl">🌶️</span>, 'sriracha': <span className="text-2xl">🌶️</span>, 'wasabi': <span className="text-2xl">🌶️</span>, 'křen': <span className="text-2xl">🌶️</span>, 'česneková pasta': <span className="text-2xl">🧄</span>, 'zázvorová pasta': <span className="text-2xl">🟡</span>,
        
        // Výchozí ikonka pro neznámé ingredience
        'default': <Utensils className="w-6 h-6 text-gray-600" />
    }), []);

    // Funkce pro získání ikonky podle názvu ingredience - univerzální a efektivní
    const getIngredientIcon = useCallback((name: string): React.ReactNode => {
        const nameLower = name.toLowerCase();
        
        // Nejdříve zkusit přesnou shodu
        if (ingredientIconMap[nameLower]) {
            return ingredientIconMap[nameLower];
        }
        
        // Pak zkusit částečnou shodu
        for (const [ingredient, icon] of Object.entries(ingredientIconMap)) {
            if (ingredient !== 'default' && (nameLower.includes(ingredient) || ingredient.includes(nameLower))) {
                return icon;
            }
        }
        
        // Výchozí ikonka
        return ingredientIconMap.default;
    }, [ingredientIconMap]);

    // Definice kategorií ingrediencí pro rychlé filtrování
    const ingredientCategories = useMemo((): { [key: string]: string[] } => ({
        'těstoviny': ['spaghetti', 'penne', 'farfalle', 'fusilli', 'rigatoni', 'linguine', 'tagliatelle', 'lasagne', 'ravioli', 'tortellini', 'gnocchi', 'macaroni', 'orecchiette', 'pappardelle', 'cannelloni', 'špagety'],
        'rýže': ['rýže', 'basmati', 'jasmine', 'arborio', 'natural rýže'],
        'maso': ['kuřecí', 'hovězí', 'vepřové', 'jehněčí', 'krůtí', 'králičí', 'telecí', 'skopové', 'steak', 'kotlety', 'mleté', 'kachní'],
        'ryby': ['losos', 'tuňák', 'treska', 'platýs', 'makrela', 'sardinky', 'ančovičky', 'pstruh', 'mořské plody', 'krevety', 'mušle'],
        'zelenina': ['mrkev', 'cibule', 'česnek', 'paprika', 'rajčata', 'okurka', 'salát', 'špenát', 'brokolice', 'květák', 'zelí', 'brambory', 'cuketa', 'lilek', 'dýně', 'řepa', 'celer'],
        'sýr': ['parmezán', 'mozzarella', 'cheddar', 'gouda', 'feta', 'ricotta', 'cottage', 'balkánský', 'eidam', 'hermelín', 'niva', 'olomoucké tvarůžky'],
        'bylinky': ['bazalka', 'oregano', 'tymián', 'rozmarýn', 'šalvěj', 'petržel', 'kopr', 'máta', 'koriandr', 'majoránka', 'libeček', 'meduňka'],
        'koření': ['pepř', 'sůl', 'kurkuma', 'kari', 'kardamom', 'skořice', 'muškátový oříšek', 'hřebíček', 'kmín', 'fenykl', 'anýz', 'vanilka'],
        'ovoce': ['jablka', 'hrušky', 'banány', 'pomeranče', 'citrony', 'limetky', 'jahody', 'maliny', 'borůvky', 'hroznové víno', 'kiwi', 'mango'],
        'ořechy': ['vlašské ořechy', 'mandle', 'kešu', 'lískové ořechy', 'arašídy', 'pistácie', 'slunečnicová semínka', 'dýňová semínka'],
        'mléčné výrobky': ['mléko', 'smetana', 'jogurt', 'tvaroh', 'máslo', 'kefír', 'zakysaná smetana', 'šlehačka'],
        'vejce': ['vejce', 'vajíčka', 'bílky', 'žloutky']
    }), []);

    // Mapování mezi variantami názvů ingrediencí
    const ingredientAliases = useMemo((): { [key: string]: string[] } => ({
        'kachní': ['kachna', 'kachní maso', 'kachní prsa', 'kachní stehno'],
        'kachna': ['kachní', 'kachní maso', 'kachní prsa', 'kachní stehno'],
        'kuřecí': ['kuře', 'kuřecí maso', 'kuřecí prsa', 'kuřecí stehno'],
        'kuře': ['kuřecí', 'kuřecí maso', 'kuřecí prsa', 'kuřecí stehno'],
        'hovězí': ['hovězí maso', 'steak', 'hovězí svíčková'],
        'vepřové': ['vepř', 'vepřové maso', 'vepřová kotleta'],
        'vepř': ['vepřové', 'vepřové maso', 'vepřová kotleta'],
        'losos': ['lososové maso', 'lososový filet'],
        'tuňák': ['tuňákové maso', 'tuňákový filet'],
        'mrkev': ['mrkve', 'mrkvový'],
        'cibule': ['cibulka', 'cibulový'],
        'česnek': ['česnekový'],
        'rajčata': ['rajče', 'rajčatový'],
        'rajče': ['rajčata', 'rajčatový'],
        'brambory': ['brambor', 'bramborový'],
        'brambor': ['brambory', 'bramborový'],
        'vejce': ['vajíčka', 'vajíčko'],
        'vajíčka': ['vejce', 'vajíčko'],
        'mléko': ['mléčný'],
        'smetana': ['smetanový'],
        'máslo': ['máslový'],
        'sýr': ['sýrový'],
        'chléb': ['chlebový'],
        'rýže': ['rýžový'],
        'těstoviny': ['těstovinový'],
        'zelenina': ['zeleninový'],
        'ovoce': ['ovocný'],
        'maso': ['masový'],
        'ryby': ['rybí'],
        'houby': ['houbový'],
        'koření': ['kořeněný'],
        'bylinky': ['bylinkový']
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
        if (!selectedIngredients.some(ing => ing.name === ingredient)) {
            setSelectedIngredients(prev => [...prev, { name: ingredient, mode: defaultMode }]);
        }
    }, [selectedIngredients, defaultMode]);

    const handleToggleIngredientMode = useCallback((ingredient: string) => {
        setSelectedIngredients(prev => prev.map(ing =>
            ing.name === ingredient ? { ...ing, mode: ing.mode === 'include' ? 'exclude' : 'include' } : ing
        ));
    }, []);

    const handleRemoveIngredient = useCallback((ingredient: string) => {
        setSelectedIngredients(prev => prev.filter(ing => ing.name !== ingredient));
    }, []);

    const handleClearAll = useCallback(() => {
        setSelectedIngredients([]);
    }, []);

    // Funkce pro odstranění diakritiky
    const removeDiacritics = useCallback((str: string): string => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }, []);

    // Filtrování receptů podle vybraných ingrediencí - optimalizováno s useMemo
    const filteredRecipes = useMemo(() => {
        let filtered = recipes;

        // Aplikace vegetariánského filtru
        if (vegetarianOnly) {
            const nonVegetarianIngredients = [
                'maso', 'kuřecí', 'kuře', 'hovězí', 'vepřové', 'vepř', 'jehněčí', 'krůtí', 'krůta', 
                'králičí', 'telecí', 'skopové', 'steak', 'kotlety', 'mleté', 'klobása', 'salám', 
                'šunka', 'slanina', 'ryby', 'mořské plody', 'losos', 'tuňák', 'treska', 'platýs', 
                'makrela', 'sardinky', 'ančovičky', 'pstruh', 'krevety', 'mušle', 'ústřice', 
                'chobotnice', 'kalamáry', 'humr', 'krab', 'čtverzubec', 'tropická ryba', 'žralok', 'kachní', 'kachna'
            ];

            filtered = filtered.filter((recipe) => {
                if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return true;
                
                const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase().trim());
                
                // Kontrola, zda recept obsahuje nějaké nevegetariánské ingredience
                return !recipeIngredients.some(ingredient => 
                    nonVegetarianIngredients.some(nonVeg => 
                        ingredient.includes(nonVeg) || nonVeg.includes(ingredient)
                    )
                );
            });
        }

        // Aplikace filtru podle vybraných ingrediencí
        if (selectedIngredients.length === 0) {
            return filtered;
        }

        return filtered.filter((recipe) => {
            if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return false;
            
            const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase().trim());
            
            return selectedIngredients.every(selectedIng => {
                const selectedIngLower = selectedIng.name.toLowerCase();
                const selectedIngWithoutDiacritics = removeDiacritics(selectedIngLower);
                // Pokud je vybraná ingredience kategorie, hledej všechny ingredience z této kategorie
                if (ingredientCategories[selectedIngLower]) {
                    const categoryIngredients = ingredientCategories[selectedIngLower];
                    if (selectedIng.mode === 'include') {
                        // alespoň jedna z kategorie musí být v receptu
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
                    } else {
                        // žádná z kategorie nesmí být v receptu
                        return categoryIngredients.every(categoryIng => {
                            const categoryIngLower = categoryIng.toLowerCase();
                            const categoryIngWithoutDiacritics = removeDiacritics(categoryIngLower);
                            return recipeIngredients.every(recipeIng => {
                                const recipeIngWithoutDiacritics = removeDiacritics(recipeIng);
                                return !(
                                    recipeIng.includes(categoryIngLower) ||
                                    categoryIngLower.includes(recipeIng) ||
                                    recipeIngWithoutDiacritics.includes(categoryIngWithoutDiacritics) ||
                                    categoryIngWithoutDiacritics.includes(recipeIngWithoutDiacritics)
                                );
                            });
                        });
                    }
                }
                // Jinak hledej konkrétní ingredienci (původní logika)
                if (selectedIng.mode === 'include') {
                    // ... původní logika pro zahrnutí ...
                    return recipeIngredients.some(recipeIng => {
                        const recipeIngWithoutDiacritics = removeDiacritics(recipeIng);
                        if (recipeIng.includes(selectedIngLower) || 
                            selectedIngLower.includes(recipeIng) ||
                            recipeIngWithoutDiacritics.includes(selectedIngWithoutDiacritics) ||
                            selectedIngWithoutDiacritics.includes(recipeIngWithoutDiacritics)) {
                            return true;
                        }
                        const aliases = ingredientAliases[selectedIngLower] || [];
                        return aliases.some(alias => {
                            const aliasLower = alias.toLowerCase();
                            const aliasWithoutDiacritics = removeDiacritics(aliasLower);
                            return recipeIng.includes(aliasLower) || 
                                   aliasLower.includes(recipeIng) ||
                                   recipeIngWithoutDiacritics.includes(aliasWithoutDiacritics) ||
                                   aliasWithoutDiacritics.includes(recipeIngWithoutDiacritics);
                        });
                    });
                } else {
                    // exclude (nemám) – recept ji nesmí obsahovat
                    return recipeIngredients.every(recipeIng => {
                        const recipeIngWithoutDiacritics = removeDiacritics(recipeIng);
                        if (recipeIng.includes(selectedIngLower) || 
                            selectedIngLower.includes(recipeIng) ||
                            recipeIngWithoutDiacritics.includes(selectedIngWithoutDiacritics) ||
                            selectedIngWithoutDiacritics.includes(recipeIngWithoutDiacritics)) {
                            return false;
                        }
                        const aliases = ingredientAliases[selectedIngLower] || [];
                        return !aliases.some(alias => {
                            const aliasLower = alias.toLowerCase();
                            const aliasWithoutDiacritics = removeDiacritics(aliasLower);
                            return recipeIng.includes(aliasLower) || 
                                   aliasLower.includes(recipeIng) ||
                                   recipeIngWithoutDiacritics.includes(aliasWithoutDiacritics) ||
                                   aliasWithoutDiacritics.includes(recipeIngWithoutDiacritics);
                        });
                    });
                }
            });
        });
    }, [recipes, selectedIngredients, ingredientCategories, removeDiacritics, vegetarianOnly, ingredientAliases]);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-2 sm:p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 px-2">
                    <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-2 sm:mb-4">
                        Filtrování receptů podle ingrediencí
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Vyberte ingredience, které máte doma, a najdeme recepty, které můžete připravit
                    </p>
                </div>

                {/* Filtrovací sekce */}
                <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-6 sm:mb-8 border border-blue-100">
                    <h2 className="text-lg sm:text-xl font-semibold text-blue-900 mb-3 sm:mb-4">Vyberte ingredience</h2>
                    
                    {/* Vegetariánský filtr */}
                    <div className="mb-4 sm:mb-6">
                        <button
                            onClick={() => setVegetarianOnly(!vegetarianOnly)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base ${
                                vegetarianOnly 
                                    ? 'bg-green-100 border-green-300 text-green-800 shadow-md' 
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-200'
                            }`}
                        >
                            <span className="text-xl">🥬</span>
                            <span className="font-medium">
                                {vegetarianOnly ? 'Pouze vegetariánská jídla' : 'Zobrazit vegetariánská jídla'}
                            </span>
                            {vegetarianOnly && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Kategorie ingrediencí */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Rychlé kategorie:</h3>
                        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3">
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
                                        if (!selectedIngredients.some(ing => ing.name === cat.category)) {
                                            setSelectedIngredients(prev => [...prev, { name: cat.category, mode: defaultMode }]);
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
                    <div className="mb-3 sm:mb-4">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Nebo vyhledejte konkrétní ingredienci:</h3>
                        <div className="flex gap-1 sm:gap-2 items-center mb-1 sm:mb-2">
                            <span className={`px-2 sm:px-3 py-1 rounded-full cursor-pointer font-medium text-xs sm:text-base ${defaultMode === 'include' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                onClick={() => setDefaultMode('include')}
                            >
                                Mám
                            </span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full cursor-pointer font-medium text-xs sm:text-base ${defaultMode === 'exclude' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                onClick={() => setDefaultMode('exclude')}
                            >
                                Nemám
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <div className="flex-1">
                                <SearchInput 
                                    onAddIngredient={handleAddIngredient}
                                    allIngredients={allIngredients}
                                    selectedIngredients={selectedIngredients.map(ing => ing.name)}
                                    ingredientCategories={ingredientCategories}
                                />
                            </div>
                            <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                                <Button
                                    onClick={() => setShowAllIngredientsModal(true)}
                                    variant="outline"
                                    className="px-3 sm:px-4 flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-xs sm:text-base"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    Všechny ingredience
                                </Button>
                                <Button
                                    onClick={handleClearAll}
                                    variant="outline"
                                    className="px-3 sm:px-4 flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-xs sm:text-base"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    Vymazat vše
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Vybrané ingredience */}
                    {selectedIngredients.length > 0 && (
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Vybrané ingredience:</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedIngredients.map((ingredient, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${ingredient.mode === 'include' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                                    >
                                        <span className="text-lg">{getIngredientIcon(ingredient.name)}</span>
                                        <span>{ingredient.name}</span>
                                        <button
                                            onClick={() => handleToggleIngredientMode(ingredient.name)}
                                            className="hover:bg-gray-200 rounded-full p-1"
                                            title={ingredient.mode === 'include' ? 'Přepnout na "nemám"' : 'Přepnout na "mám"'}
                                        >
                
                                        </button>
                                        <button
                                            onClick={() => handleRemoveIngredient(ingredient.name)}
                                            className="hover:bg-gray-200 rounded-full p-1"
                                            title="Odebrat ingredienci"
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
                        {vegetarianOnly && (
                            <span className="text-green-700 font-medium">🥬 Pouze vegetariánská</span>
                        )}
                        {selectedIngredients.length > 0 && (
                            <span>Vybrané ingredience: {selectedIngredients.length}</span>
                        )}
                    </div>
                </div>

                {/* Modal pro všechny ingredience */}
                {showAllIngredientsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col mx-0 sm:mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
                                <h2 className="text-lg sm:text-2xl font-bold text-blue-900">Všechny dostupné ingredience</h2>
                                <button
                                    onClick={() => setShowAllIngredientsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    style={{ minWidth: 44, minHeight: 44 }}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-3 sm:p-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                                    {Object.entries(ingredientCategories).map(([category, ingredients]) => (
                                        <div key={category} className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <span className="text-xl">{getIngredientIcon(category)}</span>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </h3>
                                            <div className="space-y-2">
                                                {ingredients.map((ingredient) => {
                                                    const isSelected = selectedIngredients.some(ing => ing.name === ingredient);
                                                    return (
                                                        <button
                                                            key={`${category}-${ingredient}`}
                                                            onClick={() => {
                                                                if (isSelected) {
                                                                    handleRemoveIngredient(ingredient);
                                                                } else {
                                                                    handleAddIngredient(ingredient);
                                                                }
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                                                                isSelected
                                                                    ? selectedIngredients.find(ing => ing.name === ingredient)?.mode === 'include'
                                                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                                                        : 'bg-red-100 text-red-800 border border-red-300'
                                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                                                            }`}
                                                        >
                                                            <span className="text-lg">{getIngredientIcon(ingredient)}</span>
                                                            <span className="flex-1">{ingredient}</span>
                                                            {isSelected && (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Další ingredience, které nejsou v kategoriích */}
                                <div className="mt-6 sm:mt-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                                        <span className="text-xl">🥄</span>
                                        Ostatní ingredience
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2">
                                        {allIngredients
                                            .filter(ingredient => !Object.values(ingredientCategories).flat().includes(ingredient))
                                            .map((ingredient) => {
                                                const isSelected = selectedIngredients.some(ing => ing.name === ingredient);
                                                return (
                                                    <button
                                                        key={`other-${ingredient}`}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                handleRemoveIngredient(ingredient);
                                                            } else {
                                                                handleAddIngredient(ingredient);
                                                            }
                                                        }}
                                                        className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm ${
                                                            isSelected
                                                                ? selectedIngredients.find(ing => ing.name === ingredient)?.mode === 'include'
                                                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                                                    : 'bg-red-100 text-red-800 border border-red-300'
                                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                                                        }`}
                                                    >
                                                        <span className="text-base">{getIngredientIcon(ingredient)}</span>
                                                        <span className="flex-1 truncate">{ingredient}</span>
                                                        {isSelected && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-blue-600 flex-shrink-0">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 gap-2 sm:gap-0">
                                <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-0">
                                    Vybráno: {selectedIngredients.length} ingrediencí
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={handleClearAll}
                                        variant="outline"
                                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 w-1/2 sm:w-auto"
                                    >
                                        Vymazat vše
                                    </Button>
                                    <Button
                                        onClick={() => setShowAllIngredientsModal(false)}
                                        className="bg-blue-600 hover:bg-blue-700 w-1/2 sm:w-auto"
                                    >
                                        Vyhledat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Výsledky */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6">
                        {selectedIngredients.length > 0 
                            ? `Recepty s ingrediencemi (${filteredRecipes.length})`
                            : `Všechny recepty (${filteredRecipes.length})`
                        }
                    </h2>

                    {filteredRecipes.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="text-gray-400 mb-2 sm:mb-4">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">
                                Nebyly nalezeny žádné recepty
                            </h3>
                            <p className="text-xs sm:text-base text-gray-500">
                                {selectedIngredients.length > 0 
                                    ? "Zkuste vybrat méně ingrediencí nebo jiné ingredience."
                                    : "Zkuste vybrat nějaké ingredience pro filtrování."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {filteredRecipes.map((recipe) => (
                                <RecipeCard
                                    key={`${recipe.category}-${recipe.slug}`}
                                    recipe={recipe}
                                    onClick={() => window.location.href = `/${recipe.category}/${recipe.slug}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
