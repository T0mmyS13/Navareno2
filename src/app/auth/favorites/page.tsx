"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

interface FavoriteRecipe {
  recipe_slug: string;
  category: string;
  title: string;
  image?: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/favorites", { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        setFavorites(data);
        setLoading(false);
      });
  }, [session, status]);

  if (status === "loading" || loading) {
    return <div className="text-center py-10">Načítám oblíbené recepty...</div>;
  }

  if (!session?.user) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-xl font-bold mb-4">Pro zobrazení oblíbených receptů se musíte nejdříve přihlásit.</h2>
        <Link
          href="/auth/signin"
          className="inline-block mt-4 px-6 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
        >
          Přihlásit se
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Moje oblíbené recepty</h1>
      {favorites.length === 0 ? (
        <div className="text-center text-gray-500">Nemáte žádné oblíbené recepty.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favorites.map((fav) => (
            <Link
              key={fav.recipe_slug + fav.category}
              href={`/${fav.category}/${fav.recipe_slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100 hover:border-amber-400"
            >
              {fav.image && (
                <div className="relative w-full h-40 bg-gray-100">
                  <Image
                    src={fav.image}
                    alt={fav.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{fav.title}</h2>
                <div className="text-sm text-gray-500">Kategorie: {fav.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
