"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardMedia, Typography, Rating, Box, Chip, Stack, CardActionArea } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

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
  slug: string;
  category: string;
}

// Funkce pro odstranění diakritiky
function removeDiacritics(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query") || "";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllRecipes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/recipes");
        if (!response.ok) throw new Error("Nepodařilo se načíst recepty");
        const data = await response.json();
        setRecipes(data);
      } catch {
        setError("Nepodařilo se načíst recepty. Zkuste to později.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllRecipes();
  }, [query]);

  const filtered = recipes.filter(recipe =>
    removeDiacritics(recipe.title.toLowerCase()).includes(removeDiacritics(query.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Výsledky hledání pro &quot;{query}&quot;</h1>
      {loading && <div className="text-center">Načítám...</div>}
      {error && <div className="text-center text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? filtered.map(recipe => (
            <Card key={recipe.title} sx={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} elevation={3}>
              <CardActionArea onClick={() => router.push(`/${recipe.category}/${recipe.slug}`)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <CardMedia component="img" image={recipe.image} alt={recipe.title} sx={{ height: 180, objectFit: 'cover' }} />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>{recipe.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>{recipe.description}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip icon={<AccessTimeIcon />} label={`${recipe.time} min`} variant="outlined" size="small" />
                    <Chip icon={<FitnessCenterIcon />} label={recipe.difficulty} variant="outlined" size="small" />
                  </Stack>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Rating value={Number(recipe.rating_count) && Number(recipe.rating_sum) ? Number(recipe.rating_sum) / Number(recipe.rating_count) : 0} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>({recipe.rating_count || 0}x)</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          )) : (
            <div className="col-span-full text-center py-8">
              <p>Nebyly nalezeny žádné recepty.</p>
              <Link href="/new-recipe" className="mt-4 inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition">Přidat nový recept</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
