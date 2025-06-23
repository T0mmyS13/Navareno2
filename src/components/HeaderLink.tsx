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
        <nav className="bg-white shadow-md px-4 py-3 flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
                <Link
                    key={cat.title}
                    href={cat.link}
                    className={`text-sm sm:text-base font-medium text-gray-700 hover:text-blue-600 transition ${
                        cat.title === "Přidat recept" ? "text-green-600 font-semibold" : ""
                    } ${cat.title === "Nakupní seznam" ? "text-orange-600 font-semibold" : ""}`}
                >
                    {cat.title}
                </Link>
            ))}
        </nav>
    );
};

export default HeaderLink;
