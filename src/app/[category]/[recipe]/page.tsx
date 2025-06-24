// src/app/[category]/[recipe]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useToast } from "@/utils/ToastNotify";
import { getDeclinedUnit, convertUnits } from "@/utils/units";
import Rating from '@mui/material/Rating';

// Typy pro komponenty
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}
interface Recipe {
  title: string;
  image: string;
  difficulty: number;
  time: number;
  rating_sum?: number;
  rating_count?: number;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  portion: number;
  [key: string]: unknown;
}


export default function RecipeDetailPage() {
  const params = useParams();
  const category = params.category as string;
  const recipeName = params.recipe as string;
  // const router = useRouter();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [portionCount, setPortionCount] = useState(2);
  const [adjustedIngredients, setAdjustedIngredients] = useState<Ingredient[]>([]);

  // Uložení zaškrtnutých řádků
  const storageKey = `checkedRows_${category}_${recipeName}`;
  const [checkedRows, setCheckedRows] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Načtení receptu ze serveru
  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recipes/${category}/${recipeName}`);
        if (!res.ok) throw new Error("Recipe not found");
        const data: Recipe = await res.json();
        setRecipe(data);
        setAdjustedIngredients(data.ingredients);
        setPortionCount(data.portion || 2);
      } catch {
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [category, recipeName]);

  // Funkce pro úpravu počtu porcí
  const adjustIngredientsForPortions = (
      ingredients: Ingredient[],
      currentPortions: number,
      targetPortions: number
  ): Ingredient[] => {
    return ingredients.map(ingredient => {
      if (ingredient.quantity > 0) {
        return {
          ...ingredient,
          quantity: ingredient.quantity * (targetPortions / currentPortions),
        };
      }
      return ingredient;
    });
  };

  // Handler pro změnu počtu porcí
  const handlePortionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPortionCount = Math.max(1, Number(e.target.value));
    setPortionCount(newPortionCount);

    if (recipe && recipe.ingredients) {
      const adjusted = adjustIngredientsForPortions(
          recipe.ingredients,
          recipe.portion || 2,
          newPortionCount
      ).map(ingredient => {
        const { quantity, unit } = convertUnits(ingredient.quantity, ingredient.unit);
        return { ...ingredient, quantity, unit };
      });
      setAdjustedIngredients(adjusted);
    }
  };

  // Handler pro přidání do nákupního seznamu
  const saveToCart = () => {
    if (typeof window !== 'undefined') {
      const storedIngredients = JSON.parse(localStorage.getItem("cart") || "[]");
      const ingredientsToAdd = adjustedIngredients.filter((_, index) => !checkedRows.includes(index));
      const updatedIngredients = [...storedIngredients, ...ingredientsToAdd];
      localStorage.setItem("cart", JSON.stringify(updatedIngredients));
      showToast("Ingredience byly přidány do nákupního seznamu.", "success");
    }
  };

  // Handler pro změnu zaškrtnutí
  const handleCheckboxChange = (index: number) => {
    const newCheckedRows = checkedRows.includes(index)
        ? checkedRows.filter(id => id !== index)
        : [...checkedRows, index];

    setCheckedRows(newCheckedRows);

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newCheckedRows));
    }
  };

  // Hodnocení receptu
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showRatingBox, setShowRatingBox] = useState(false);
  const ratingBoxRef = React.useRef<HTMLDivElement>(null);
  const averageRating = recipe && recipe.rating_count && recipe.rating_sum
    ? recipe.rating_sum / recipe.rating_count
    : 0;

  useEffect(() => {
    // Zjisti, zda uživatel již hlasoval (z cookie)
    if (typeof window !== 'undefined') {
      const cookieName = `voted_${category}_${recipeName}`;
      const cookies = document.cookie.split(';').map(c => c.trim());
      const found = cookies.find(c => c.startsWith(cookieName + '='));
      setHasVoted(!!found);
    }
  }, [category, recipeName]);

  useEffect(() => {
    // Skryj rating box při kliknutí mimo
    if (!showRatingBox) return;
    function handleClickOutside(event: MouseEvent) {
      if (ratingBoxRef.current && !ratingBoxRef.current.contains(event.target as Node)) {
        setShowRatingBox(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRatingBox]);

  const handleRate = async (value: number | null) => {
    if (!value) return;
    setIsRatingLoading(true);
    try {
      const res = await fetch(`/api/recipes/${category}/${recipeName}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value })
      });
      if (!res.ok) {
        const data = await res.json();
        if (data?.error === 'Již jste hlasovali.') {
          setHasVoted(true);
          showToast('Již jste hlasovali.', 'info');
          return;
        }
        throw new Error('Chyba při ukládání hodnocení');
      }
      const data = await res.json();
      setUserRating(value);
      setRecipe((prev) => prev ? { ...prev, rating_sum: data.rating_sum, rating_count: data.rating_count } : prev);
      setHasVoted(true);
      showToast('Děkujeme za hodnocení!', 'success');
    } catch {
      showToast('Chyba při ukládání hodnocení', 'error');
    } finally {
      setIsRatingLoading(false);
    }
  };

  // Zobrazení obtížnosti
  const renderDifficulty = (difficulty: number) => {
    const labels = ["Snadné", "Střední", "Obtížné"];
    return labels[difficulty - 1] || "Neznámá obtížnost";
  };

  if (loading) {
    return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
          <p>Načítám recept...</p>
        </div>
    );
  }

  if (!recipe) {
    return (
        <div className="text-center py-8">
          <p className="text-red-600">Recept nebyl nalezen</p>
          <Link href={`/${category}`} className="mt-4 inline-block px-4 py-2 bg-amber-500 text-white rounded-lg">
            Zpět na kategorii
          </Link>
        </div>
    );
  }


  return (
      <div className="max-w-4xl mx-auto p-2 sm:p-4 recipe-detail">

        {/* Hlavička receptu */}
        <div className="mb-6 relative h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden shadow-lg">
          {recipe.image ? (
              <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 800px"
                  className="object-cover"
              />
          ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Obrázek není k dispozici</p>
              </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">{recipe.title}</h1>
            <p className="text-white text-sm sm:text-base">{recipe.description}</p>

            <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-white text-sm sm:text-base gap-1 sm:gap-4">
              <span>Čas: {recipe.time} min</span>
              <span>Obtížnost: {renderDifficulty(recipe.difficulty)}</span>
              <span className="flex items-center gap-1 text-xs sm:text-sm opacity-80">
                <Rating
                  name="recipe-rating"
                  value={averageRating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ color: '#FFD700', fontSize: { xs: 16, sm: 18, md: 20 } }}
                />
                <span>({recipe.rating_count || 0}x)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 mb-6">
            <Link
                href={`/${category}`}
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white py-2 px-5 rounded-lg shadow-lg font-bold no-underline transition-all duration-200 text-center w-full sm:w-auto border-2 border-white/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                style={{ whiteSpace: "nowrap", letterSpacing: 1 }}
            >
              ← Zpět na kategorii
            </Link>
            {!hasVoted && (
              <div className="flex flex-col items-start sm:items-center mt-2 relative">
                <button
                  className="text-amber-600 font-semibold text-sm sm:text-base mb-1 focus:outline-none focus:underline hover:underline cursor-pointer bg-transparent border-none p-0"
                  onClick={() => setShowRatingBox(true)}
                  tabIndex={0}
                  type="button"
                >
                  Ohodnotit tento recept
                </button>
                {showRatingBox && (
                  <div
                    ref={ratingBoxRef}
                    style={{ position: 'absolute', zIndex: 10, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: 12, marginTop: 4, left: 0 }}
                    className="sm:static sm:ml-2"
                  >
                    <Rating
                      name="user-rating"
                      value={userRating}
                      onChange={(_, value) => handleRate(value)}
                      disabled={isRatingLoading || !!userRating}
                      size="large"
                      sx={{ fontSize: { xs: 28, sm: 32, md: 36 } }}
                    />
                  </div>
                )}
              </div>
            )}
            {hasVoted && (
              <span className="text-xs text-gray-500 ml-2 mt-2">Již jste hlasovali</span>
            )}
          </div>

          <div className="recipe-content">
            {/* Ingredience */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ingredience</h2>

            <div className="portion-input mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <label htmlFor="portion-count" className="font-medium">Počet porcí:</label>
              <input
                  id="portion-count"
                  type="number"
                  className="w-24 p-2 border border-gray-300 rounded"
                  value={portionCount}
                  onChange={handlePortionChange}
                  min="1"
              />
            </div>

            {adjustedIngredients && adjustedIngredients.length > 0 ? (
                <div className="ingredients-container mb-6 w-full overflow-x-auto" style={{ height: 400, minWidth: 320 }}>
                  <DataGrid
                      rows={adjustedIngredients.map((ingredient, index) => ({
                        id: index,
                        name: ingredient.name,
                        quantity: ingredient.quantity,
                        unit: getDeclinedUnit(ingredient.unit, ingredient.quantity),
                        isChecked: checkedRows.includes(index),
                      }))}
                      columns={[
                        {
                          field: 'checkbox',
                          headerName: 'Mám',
                          renderCell: (params) => (
                              <Checkbox
                                  checked={params.row.isChecked}
                                  onChange={() => handleCheckboxChange(params.row.id)}
                                  color="primary"
                              />
                          ),
                          width: 85,
                        },
                        { field: 'name', headerName: 'Ingredience', flex: 1 },
                        { field: 'quantity', headerName: 'Množství', flex: 1, type: 'number' },
                        { field: 'unit', headerName: 'Jednotka', flex: 1 },
                      ]}
                      hideFooter
                      getRowClassName={(params) => params.row.isChecked ? 'checked-row' : ''}
                      sx={{
                        '& .checked-row': {
                          textDecoration: 'line-through',
                          color: 'text.disabled',
                        },
                      }}
                  />
                </div>
            ) : (
                <p>Ingredience nejsou k dispozici.</p>
            )}

            <button
                className="bg-[#4caf50] hover:bg-[#388e3c] text-white py-2 px-6 rounded-lg transition-colors mb-8"
                onClick={saveToCart}
            >
              Uložit do nákupního seznamu
            </button>

            {/* Postup */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Postup</h2>

            {/* Hodnocení */}
            {/* (přesunuto nahoru) */}

            {recipe.instructions && recipe.instructions.length > 0 ? (
                <ol className="space-y-4 mb-8">
                  {recipe.instructions.map((step, index) => (
                      <li key={index} className="flex">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-amber-500 text-white rounded-full mr-3">
                    {index + 1}
                  </span>
                        <div className="mt-1">{step}</div>
                      </li>
                  ))}
                </ol>
            ) : (
                <p>Postup není k dispozici.</p>
            )}

            {/* Akce pro úpravu a kopírování receptu */}
            <div className="flex justify-center gap-4 mt-8">
              {/*
              <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCopyRecipe}
              >
                Kopírovat recept
              </Button>
              <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditRecipe}
              >
                Upravit recept
              </Button>
              */}
            </div>
          </div>
        </div>
      </div>
  );
}