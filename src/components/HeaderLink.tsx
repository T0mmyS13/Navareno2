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
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    // Mobile extraLinks close on click outside
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!categoryMenuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
                setCategoryMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [categoryMenuOpen]);

    useEffect(() => {
        if (!userMenuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuOpen]);

    useEffect(() => {
        if (!mobileMenuOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [mobileMenuOpen]);

    const mainCategories: CategoryLink[] = [
        { title: "Předkrmy", link: "/predkrmy" },
        { title: "Polévky", link: "/polevky" },
        { title: "Saláty", link: "/salaty" },
        { title: "Hlavní chody", link: "/hlavni-chody" },
        { title: "Dezerty", link: "/dezerty" },
        { title: "Nápoje", link: "/napoje" },
    ];
    const extraLinks: CategoryLink[] = [
        { title: "Přidat recept", link: "/new-recipe", colorClass: "text-green-700 bg-green-50 border border-green-300 hover:bg-green-100" },
        { title: "Nakupní seznam", link: "/cart", colorClass: "text-blue-700 bg-blue-50 border border-blue-300 hover:bg-blue-100" },
        { title: "Oblíbené recepty", link: "/auth/favorites", colorClass: "text-yellow-700 bg-yellow-50 border border-yellow-300 hover:bg-yellow-100" },
    ];

    return (
        <nav className="bg-gradient-to-r from-white via-blue-50 to-white shadow-lg px-4 sm:px-8 py-5 flex items-center gap-4 sm:gap-6 rounded-xl border border-blue-100">
            {/* Kategorie button always visible */}
            <div className="flex flex-1 items-center gap-2 sm:gap-6 justify-center">
                <div className="relative" ref={categoryMenuRef}>
                    <button
                        type="button"
                        className="text-base sm:text-lg font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 border border-blue-200 bg-blue-50 hover:bg-blue-100"
                        onClick={() => setCategoryMenuOpen((v) => !v)}
                    >
                        Kategorie
                    </button>
                    {categoryMenuOpen && (
                        <div className="absolute left-0 mt-2 w-max min-w-[220px] sm:min-w-[260px] bg-white border border-blue-200 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-2 animate-fade-in">
                            {mainCategories.map((cat) => (
                                <Link
                                    key={cat.title}
                                    href={cat.link}
                                    className="text-base font-semibold px-5 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-blue-50"
                                    onClick={() => setCategoryMenuOpen(false)}
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {/* Desktop: show extraLinks, Mobile: hide extraLinks */}
                <div className="hidden sm:flex gap-2">
                    {extraLinks.map((cat) => (
                        <Link
                            key={cat.title}
                            href={cat.link}
                            className={`text-base sm:text-lg font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 ${cat.colorClass ? cat.colorClass : ''}`}
                        >
                            {cat.title}
                        </Link>
                    ))}
                </div>
            </div>
            {/* User menu and mobile menu toggle */}
            {session && session.user && (
                <div className="relative flex items-center justify-end min-w-[120px]" ref={userMenuRef}>
                    {/* Mobile: hamburger for extraLinks */}
                    <button
                        type="button"
                        className="sm:hidden mr-2 p-2 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all"
                        aria-label="Otevřít menu"
                        onClick={() => setMobileMenuOpen((v) => !v)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    {/* User button always visible */}
                    <button
                        type="button"
                        className="flex items-center gap-2 text-base sm:text-lg font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 border border-blue-200 bg-blue-50 hover:bg-blue-100"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => setUserMenuOpen((v) => !v)}
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
                        <span className="hidden xs:inline">{session.user.name || session.user.email}</span>
                    </button>
                    {/* User dropdown */}
                    {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-200 rounded-lg shadow-lg z-50 flex flex-col">
                            <Link
                                href="/auth/profile"
                                className="px-4 py-2 hover:bg-blue-50 text-left text-blue-700 border-b border-blue-100"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                Spravovat profil
                            </Link>
                            <button
                                className="px-4 py-2 hover:bg-blue-50 text-left text-red-600 text-base w-full text-start cursor-pointer"
                                onClick={() => { setUserMenuOpen(false); signOut(); }}
                                type="button"
                            >
                                Odhlásit se
                            </button>
                        </div>
                    )}
                    {/* Mobile: extraLinks dropdown */}
                    {mobileMenuOpen && (
                        <div
                            ref={mobileMenuRef}
                            className="absolute right-0 mt-2 w-max min-w-[220px] bg-white border border-blue-200 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-2 animate-fade-in"
                            style={{ top: '43px' }}
                        >
                            {extraLinks.map((cat) => (
                                <Link
                                    key={cat.title}
                                    href={cat.link}
                                    className={`text-base font-semibold px-5 py-3 rounded-lg transition-all duration-200 hover:scale-105 hover:bg-blue-50 text-center ${cat.colorClass ? cat.colorClass : ''}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {cat.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {!session && (
                <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 text-base sm:text-lg font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-200 shadow-sm hover:scale-105 hover:bg-blue-100/60 border border-blue-200 bg-blue-50 hover:bg-blue-100 ml-2"
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
