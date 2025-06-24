"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchWithSuggestions() {
	const [value, setValue] = useState("");
	const [suggestion, setSuggestion] = useState("");
	const [active, setActive] = useState(false);
	const [allSuggestions, setAllSuggestions] = useState<string[]>([]);
	const router = useRouter();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const suggestionIndex = useRef(0);
	const charIndex = useRef(0);

	// Fetch all recipe titles for suggestions
	useEffect(() => {
		async function fetchTitles() {
			try {
				const res = await fetch("/api/recipes");
				if (!res.ok) return;
				const data = await res.json();
				// Fix: type the data as { title: string }[]
				const titles = Array.from(new Set((data as { title: string }[]).map(r => r.title).filter((t): t is string => Boolean(t))));
				// Shuffle the titles array for random order
				for (let i = titles.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[titles[i], titles[j]] = [titles[j], titles[i]];
				}
				setAllSuggestions(titles.length > 0 ? titles : [
					"Kuřecí řízek",
					"Rajská omáčka",
					"Tiramisu",
					"Bramborový salát",
					"Guláš",
					"Palačinky",
					"Svíčková",
					"Hovězí vývar",
					"Jablečný koláč",
					"Cuketová polévka",
					"Lasagne",
					"Domácí limonáda",
				]);
			} catch {}
		}
		fetchTitles();
	}, []);

	// Typing animation for suggestions
	useEffect(() => {
		if (active || value) {
			if (intervalRef.current) clearTimeout(intervalRef.current);
			return;
		}
		suggestionIndex.current = 0;
		charIndex.current = 0;
		setSuggestion("");
		let current = allSuggestions[suggestionIndex.current] || "";
		function typeNextChar() {
			if (charIndex.current < current.length) {
				setSuggestion(current.slice(0, charIndex.current + 1));
				charIndex.current++;
				intervalRef.current = setTimeout(typeNextChar, 80);
			} else {
				intervalRef.current = setTimeout(() => {
					suggestionIndex.current = (suggestionIndex.current + 1) % allSuggestions.length;
					charIndex.current = 0;
					current = allSuggestions[suggestionIndex.current] || "";
					setSuggestion("");
					intervalRef.current = setTimeout(typeNextChar, 80);
				}, 1200);
			}
		}
		typeNextChar();
		return () => {
			if (intervalRef.current) clearTimeout(intervalRef.current);
		};
	}, [active, value, allSuggestions]);

	// Prevent suggestion flicker on focus/blur
	const handleFocus = () => {
		setActive(true);
		// Do not setSuggestion here, let useEffect handle it
	};
	const handleBlur = () => {
		setActive(false);
		// Do not setSuggestion here, let useEffect handle it
	};

	// Handle search submit
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (value.trim()) {
			router.push(`/search?query=${encodeURIComponent(value.trim())}`);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-xl flex items-center justify-center"
			autoComplete="off"
		>
			<div className="relative w-full">
				<input
					type="text"
					className="w-full rounded-full px-6 py-4 text-lg shadow-md border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition placeholder:italic placeholder:text-gray-400 bg-white"
					placeholder={active ? "Hledat recept..." : suggestion || " "}
					value={value}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onChange={(e) => setValue(e.target.value)}
				/>
				<button
					type="submit"
					className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white rounded-full px-5 py-2 font-bold shadow transition"
				>
					Hledat
				</button>
			</div>
		</form>
	);
}
