"use client";

import Link from "next/link";

type CategoryLink = {
    title: string;
    link: string;
};

const HeaderLink = () => {
    const categories: CategoryLink[] = [
        { title: "Předkrmy", link: "/predkrmy" },
        { title: "Polévky", link: "/polevky" },
        { title: "Saláty", link: "/salaty" },
        { title: "Hlavní chody", link: "/hlavni-chody" },
        { title: "Dezerty", link: "/dezerty" },
        { title: "Nápoje", link: "/napoje" },
        { title: "Přidat recept", link: "/new-recipe" },
        { title: "Nakupní seznam", link: "/cart" },
    ];

    return (
        <nav className="bg-gradient-to-r from-white via-blue-50 to-white shadow-lg px-8 py-5 flex flex-wrap justify-center gap-6 rounded-xl border border-blue-100">
            {categories.map((cat) => (
                <Link
                    key={cat.title}
                    href={cat.link}
                    className={`text-base sm:text-lg font-semibold px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 ${
                        cat.title === "Přidat recept"
                            ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                            : ""
                    } ${
                        cat.title === "Nakupní seznam"
                            ? "text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                            : ""
                    }`}
                >
                    {cat.title}
                </Link>
            ))}
        </nav>
    );
};

export default HeaderLink;
