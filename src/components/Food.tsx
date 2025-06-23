// src/components/Food.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FoodProps {
  title: string;
  image: string;
  difficulty: number;
  time: number;
  rating: string | number;
  ratingsCount: number;
  category: string;
}

export default function Food({ title, image, difficulty, time, rating, ratingsCount, category }: FoodProps) {
  // Funkce pro zobrazení obtížnosti jako hvězdiček
  const renderDifficulty = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < difficulty ? "text-amber-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Link href={`/${category}/${title.toLowerCase()}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
        <div className="relative h-48 w-full">
          <Image
            src={image || `/images/recipes/${title.toLowerCase()}.jpg`}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-xl mb-2">{title}</h3>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <div>
              <span className="mr-1">Obtížnost:</span>
              {renderDifficulty()}
            </div>
            <div>
              <span className="mr-1">Čas:</span>
              {time} min
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-amber-500 mr-1">★</span>
            <span>{rating}</span>
            <span className="text-gray-500 ml-1">({ratingsCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
