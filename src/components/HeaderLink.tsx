"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";


type CategoryLink = {
    title: string;
    link: string;
    colorClass?: string;
};

const HeaderLink = () => {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const categories: CategoryLink[] = [
        { title: "Předkrmy", link: "/predkrmy" },
        { title: "Polévky", link: "/polevky" },
        { title: "Saláty", link: "/salaty" },
        { title: "Hlavní chody", link: "/hlavni-chody" },
        { title: "Dezerty", link: "/dezerty" },
        { title: "Nápoje", link: "/napoje" },
        { title: "Přidat recept", link: "/new-recipe", colorClass: "text-green-700 bg-green-50 border border-green-300 hover:bg-green-100" },
        { title: "Nakupní seznam", link: "/cart", colorClass: "text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100" },
        { title: "Oblíbené recepty", link: "/auth/favorites", colorClass: "text-yellow-700 bg-yellow-50 border border-yellow-300 hover:bg-yellow-100" },
    ];

    return (
        <nav className="bg-gradient-to-r from-white via-blue-50 to-white shadow-lg px-8 py-5 flex items-center justify-center gap-6 rounded-xl border border-blue-100">
            <div className="flex flex-wrap gap-6 justify-center flex-1">
                {categories.map((cat) => (
                    <Link
                        key={cat.title}
                        href={cat.link}
                        className={`text-base sm:text-lg font-semibold px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60
                            ${cat.colorClass ? cat.colorClass : ""}
                        `}
                    >
                        {cat.title}
                    </Link>
                ))}
            </div>
            {session && session.user && (
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-base sm:text-lg font-semibold px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 border border-blue-200 bg-blue-50 hover:bg-blue-100 ml-2"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt="Profilovka"
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full object-cover border border-blue-300"
                            />
                        ) : (
                            <span className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-300">
                                {session.user.name ? session.user.name.charAt(0).toUpperCase() : "?"}
                            </span>
                        )}
                        <span>{session.user.name || session.user.email}</span>
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-200 rounded-lg shadow-lg z-50 flex flex-col">
                            <Link
                                href="/auth/profile"
                                className="px-4 py-2 hover:bg-blue-50 text-left text-blue-700 border-b border-blue-100"
                                onClick={() => setMenuOpen(false)}
                            >
                                Spravovat profil
                            </Link>
                            <button
                                className="px-4 py-2 hover:bg-blue-50 text-left text-red-600 text-base w-full text-start cursor-pointer"
                                onClick={() => { setMenuOpen(false); signOut(); }}
                                type="button"
                            >
                                Odhlásit se
                            </button>
                        </div>
                    )}
                </div>
            )}
            {!session && (
                <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 text-base sm:text-lg font-semibold px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 border border-blue-200 bg-blue-50 hover:bg-blue-100 ml-2"
                    style={{ marginLeft: 'auto' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                    </svg>
                    Přihlásit se
                </Link>
            )}
        </nav>
    );
};

export default HeaderLink;
