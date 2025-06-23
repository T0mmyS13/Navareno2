// app/page.tsx
"use client";

import Category from "@/components/Category";
import Image from "next/image";

type CategoryType = {
  title: string;
  link: string;
  description: string;
  image: string;
};

const categories: CategoryType[] = [
  {
    title: "Předkrmy",
    link: "/predkrmy",
    description: "Malé lahůdky, které vás skvěle naladí na hlavní chod.",
    image: "/images/predkrmy.jpg",
  },
  {
    title: "Polévky",
    link: "/polevky",
    description: "Hřejivé a chutné polévky pro každou příležitost.",
    image: "/images/polevky.jpg",
  },
  {
    title: "Saláty",
    link: "/salaty",
    description: "Lehké, zdravé a plné svěžích chutí.",
    image: "/images/salaty.jpg",
  },
  {
    title: "Hlavní chody",
    link: "/hlavni-chody",
    description: "Výborná jídla, která vás zasytí a potěší.",
    image: "/images/hlavni-chody.jpg",
  },
  {
    title: "Dezerty",
    link: "/dezerty",
    description: "Sladká tečka, kterou si zamilujete.",
    image: "/images/dezerty.jpg",
  },
  {
    title: "Nápoje",
    link: "/napoje",
    description: "Osvěžující i hřejivé nápoje pro každou chvíli.",
    image: "/images/napoje.jpg",
  },
];

export default function Home() {
  return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden mb-10 shadow-lg">
          <Image
              src="/images/hero.jpg"
              alt="Navařeno"
              fill
              className="object-cover"
              priority
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-4">
            <h1 className="text-5xl font-bold drop-shadow-md">Navařeno</h1>
            <p className="text-lg mt-2 drop-shadow-sm">
              Uvařit nikdy nebylo jednodušší
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-semibold text-center mb-2">
          Vyberte si z našich kategorií
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Od předkrmu až po dezert
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
              <Category key={cat.title} {...cat} />
          ))}
        </div>
      </div>
  );
}
