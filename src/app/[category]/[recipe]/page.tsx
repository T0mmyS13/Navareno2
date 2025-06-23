// src/app/[category]/[recipe]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Checkbox } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useToast } from "@/utils/ToastNotify";

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
  rating: string | number;
  ratingsCount: number;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  portion: number;
  [key: string]: unknown;
}

// Pomocné funkce pro konverzi jednotek (placeholder)
const convertUnits = (quantity: number, unit: string) => {
  return { quantity, unit };
};

const getDeclinedUnit = (unit: string, quantity: number) => {
  return unit;
};

export default function RecipeDetailPage() {
  const params = useParams();
  const category = params.category as string;
  const recipeName = params.recipe as string;
  const router = useRouter();
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
      } catch (error) {
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

  // Handlers pro úpravu a kopírování receptu
  const handleEditRecipe = () => {
    if (recipe && typeof window !== 'undefined') {
      sessionStorage.setItem('editingRecipe', JSON.stringify({
        ...recipe,
        category: category
      }));
      router.push("/new-recipe");
    }
  };

  const handleCopyRecipe = () => {
    if (recipe && typeof window !== 'undefined') {
      sessionStorage.setItem('copyingRecipe', JSON.stringify({
        ...recipe,
        category: category
      }));
      router.push("/new-recipe");
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
    <div className="max-w-4xl mx-auto p-4 recipe-detail">
      {/* Hlavička receptu */}
      <div className="mb-6 relative h-80 rounded-lg overflow-hidden shadow-lg">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Obrázek není k dispozici</p>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{recipe.title}</h1>
          <p className="text-white/80">{recipe.description}</p>
          
          <div className="flex items-center mt-2 text-white">
            <span className="mr-4">Čas: {recipe.time} min</span>
            <span className="mr-4">Obtížnost: {renderDifficulty(recipe.difficulty)}</span>
            <div className="flex">
              {Array.from({length: 5}).map((_, i) => (
                <span key={i} className={i < (Number(recipe.rating) || 0) ? "text-yellow-400" : "text-gray-400"}>
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Link 
          href={`/${category}`} 
          className="inline-block bg-[#ff5e57] hover:bg-[#e04e47] text-white py-2 px-4 rounded-lg mb-6 no-underline transition-colors"
        >
          ← Zpět na kategorii
        </Link>
        
        <div className="recipe-content">
          {/* Ingredience */}
          <h2 className="text-2xl font-bold mb-4">Ingredience</h2>
          
          <div className="portion-input mb-4 flex items-center">
            <label htmlFor="portion-count" className="mr-3 font-medium">Počet porcí:</label>
            <input
              id="portion-count"
              type="number"
              className="w-20 p-2 border border-gray-300 rounded"
              value={portionCount}
              onChange={handlePortionChange}
              min="1"
            />
          </div>
          
          {adjustedIngredients && adjustedIngredients.length > 0 ? (
            <div className="ingredients-container mb-6" style={{ height: 400 }}>
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
          <h2 className="text-2xl font-bold mb-4">Postup</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}