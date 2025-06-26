"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Input,
    Button,
    Textarea,
    Select,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    Alert
} from "@/components/ui";
import { Plus, Minus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/utils/ToastNotify";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Ingredient {
    name: string;
    quantity: string;
    unit: string | null;
}

interface RecipeData {
    title: string;
    description: string;
    image: string;
    portion: string;
    time: string;
    instructions: string[];
    ingredients: Ingredient[];
    category: string;
    difficulty: number;
}

const AddRecipePage: React.FC = () => {
    const { data: session, status } = useSession();

    const [isEditing, setIsEditing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [portion, setPortion] = useState("");
    const [time, setTime] = useState("");
    const [instructions, setInstructions] = useState<string[]>([""]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([
        { name: "", quantity: "", unit: null },
    ]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [difficulty, setDifficulty] = useState<number | "">();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { showToast } = useToast();
    const router = useRouter();

    // Category options
    const categoryOptions = [
        { value: "", label: "Vyberte kategorii" },
        { value: "predkrmy", label: "Předkrmy" },
        { value: "polevky", label: "Polévky" },
        { value: "salaty", label: "Saláty" },
        { value: "hlavni-chody", label: "Hlavní chody" },
        { value: "dezerty", label: "Dezerty" },
        { value: "napoje", label: "Nápoje" },
    ];

    // Difficulty options
    const difficultyOptions = [
        { value: "", label: "Vyberte složitost" },
        { value: 1, label: "Snadné" },
        { value: 2, label: "Střední" },
        { value: 3, label: "Obtížné" },
    ];

    // Unit options
    const unitOptions = [
        "g", "kg", "ml", "l", "ks", "lžička", "lžíce", "hrst", "plátek", "stroužek", "konzerva"
    ];

    // Load data from sessionStorage on mount
    useEffect(() => {
        const editingRecipeData = sessionStorage.getItem("editingRecipe");
        if (editingRecipeData) {
            const editingRecipe: RecipeData = JSON.parse(editingRecipeData);
            sessionStorage.removeItem("editingRecipe");
            setIsEditing(true);

            setTitle(editingRecipe.title);
            setDescription(editingRecipe.description);
            setImage(editingRecipe.image);
            setPortion(editingRecipe.portion);
            setTime(editingRecipe.time);
            setInstructions(editingRecipe.instructions);
            setIngredients(editingRecipe.ingredients);
            setSelectedCategory(editingRecipe.category);
            setDifficulty(editingRecipe.difficulty);
            return;
        }

        const copyingRecipeData = sessionStorage.getItem("copyingRecipe");
        if (copyingRecipeData) {
            const copyingRecipe: RecipeData = JSON.parse(copyingRecipeData);
            sessionStorage.removeItem("copyingRecipe");
            setIsCopying(true);

            setTitle(""); // new recipe must have empty title
            setDescription(copyingRecipe.description);
            setImage(copyingRecipe.image);
            setPortion(copyingRecipe.portion);
            setTime(copyingRecipe.time);
            setInstructions(copyingRecipe.instructions);
            setIngredients(copyingRecipe.ingredients);
            setSelectedCategory(copyingRecipe.category);
            setDifficulty(copyingRecipe.difficulty);
        }
    }, []);

    const handleAddIngredient = () => {
        setIngredients((prev) => [...prev, { name: "", quantity: "", unit: null }]);
    };

    const handleRemoveIngredient = (index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddInstruction = () => {
        setInstructions((prev) => [...prev, ""]);
    };

    const handleRemoveInstruction = (index: number) => {
        setInstructions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Check for HEIC/HEIF
        if (file.type === "image/heic" || file.type === "image/heif" || 
            file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
            showToast("Obrázky ve formátu HEIC/HEIF nejsou podporovány. Prosím, převeďte obrázek na JPG nebo PNG.", "error");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (typeof ev.target?.result === "string") {
                setImage(ev.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        if (!title.trim() || title.trim().length < 5) {
            setError("Název receptu musí mít alespoň 5 znaků");
            return false;
        }
        if (!description.trim() || description.trim().length < 10) {
            setError("Popis musí mít alespoň 10 znaků");
            return false;
        }
        if (!selectedCategory) {
            setError("Kategorie musí být vybrána");
            return false;
        }
        if (!difficulty) {
            setError("Složitost musí být vybrána");
            return false;
        }
        if (ingredients.length === 0 || ingredients.every((ing) => !ing.name.trim())) {
            setError("Musí být zadána alespoň jedna ingredience s názvem");
            return false;
        }
        if (ingredients.some((ing) => 
            ing.name.trim() && (
                isNaN(Number(ing.quantity)) ||
                Number(ing.quantity) <= 0 ||
                !ing.unit || ing.unit === ""
            )
        )) {
            setError("Množství u všech ingrediencí musí být platné číslo větší než 0 a musí být vyplněna jednotka");
            return false;
        }
        if (instructions.length === 0 || instructions.every((instr) => !instr.trim())) {
            setError("Musí být zadán alespoň jeden krok postupu");
            return false;
        }
        if (!portion || isNaN(Number(portion)) || Number(portion) < 1) {
            setError("Počet porcí musí být číslo větší než 0");
            return false;
        }
        if (!time || isNaN(Number(time)) || Number(time) < 1) {
            setError("Čas musí být číslo větší než 0");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Generate slug from recipe title
            const slug = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-");

            const newRecipe = {
                title,
                description,
                image,
                portion,
                time,
                instructions: instructions.filter(instr => instr.trim()),
                ingredients: ingredients.filter(ing => ing.name.trim()),
                category: selectedCategory,
                difficulty,
                slug,
                author: {
                    name: session?.user?.name || "",
                    image: session?.user?.image || null,
                },
            };

            const response = await fetch("/api/recipes", {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRecipe),
            });

            if (!response.ok) {
                throw new Error(isEditing ? "Failed to update recipe" : "Failed to add recipe");
            }

            showToast(isEditing ? "Recept úspěšně upraven" : "Recept úspěšně přidán", "success");
            router.push(`/${selectedCategory}/${slug}`);
        } catch (error) {
            console.error(error);
            setError(isEditing ? "Chyba při úpravě receptu" : "Chyba při přidávání receptu");
        } finally {
            setLoading(false);
        }
    };

    // Redirect or block if not logged in
    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!session || !session.user) {
        return (
            <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow text-center">
                <h2 className="text-xl font-bold mb-4">Pro přidání receptu se musíte nejdříve přihlásit.</h2>
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
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
                {isEditing ? "Upravit recept" : isCopying ? "Zkopírovat recept" : "Přidat nový recept"}
            </h1>

            {error && (
                <Alert variant="error" onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Základní informace</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Název receptu"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Zadejte název receptu"
                                disabled={isEditing}
                            />
                            <Select
                                label="Kategorie"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                options={categoryOptions}
                                disabled={isEditing || isCopying}
                            />
                        </div>

                        <Textarea
                            label="Krátký popis"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Popište váš recept"
                            disabled={isCopying}
                            className="placeholder:pl-2"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Čas (minuty)"
                                type="number"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                placeholder="30"
                                disabled={isCopying}
                            />
                            <Input
                                label="Počet porcí"
                                type="number"
                                value={portion}
                                onChange={(e) => setPortion(e.target.value)}
                                placeholder="4"
                                disabled={isCopying}
                            />
                            <Select
                                label="Složitost"
                                value={difficulty?.toString() || ""}
                                onChange={(e) => setDifficulty(Number(e.target.value))}
                                options={difficultyOptions}
                                disabled={isCopying}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Image Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Obrázek receptu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {image && (
                            <div className="mb-4 flex justify-center">
                                <Image
                                    src={image}
                                    alt="náhled"
                                    className="rounded-lg shadow-lg object-cover border border-gray-200 max-h-48 w-auto"
                                    width={320}
                                    height={192}
                                />
                            </div>
                        )}
                        <div className="flex justify-center">
                            <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-6 py-3 rounded-lg border border-blue-200 transition-colors duration-200 flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                <span>Nahrát obrázek</span>
                                <input
                                    accept="image/*"
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isCopying}
                                />
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Ingredients */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Ingredience
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddIngredient}
                                disabled={isCopying}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Přidat
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ingredients.map((ingredient, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <Input
                                    label="Ingredience"
                                    value={ingredient.name}
                                    onChange={(e) =>
                                        setIngredients((prev) =>
                                            prev.map((ing, i) =>
                                                i === index ? { ...ing, name: e.target.value } : ing
                                            )
                                        )
                                    }
                                    placeholder="Název ingredience"
                                    disabled={isCopying}
                                />
                                <Input
                                    label="Množství"
                                    type="number"
                                    value={ingredient.quantity}
                                    onChange={(e) =>
                                        setIngredients((prev) =>
                                            prev.map((ing, i) =>
                                                i === index ? { ...ing, quantity: e.target.value } : ing
                                            )
                                        )
                                    }
                                    placeholder="250"
                                    disabled={isCopying}
                                />
                                <Select
                                    label="Jednotka"
                                    value={ingredient.unit || ""}
                                    onChange={(e) =>
                                        setIngredients((prev) =>
                                            prev.map((ing, i) =>
                                                i === index ? { ...ing, unit: e.target.value } : ing
                                            )
                                        )
                                    }
                                    options={[
                                        { value: "", label: "Vyberte jednotku" },
                                        ...unitOptions.map(unit => ({ value: unit, label: unit }))
                                    ]}
                                    disabled={isCopying}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveIngredient(index)}
                                    disabled={ingredients.length <= 1 || isCopying}
                                    className="h-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Postup
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddInstruction}
                                disabled={isCopying}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Přidat krok
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {instructions.map((instruction, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className="flex-1">
                                    <Textarea
                                        label={`Krok ${index + 1}`}
                                        value={instruction}
                                        onChange={(e) =>
                                            setInstructions((prev) =>
                                                prev.map((instr, i) => (i === index ? e.target.value : instr))
                                            )
                                        }
                                        placeholder="Popište tento krok..."
                                        disabled={isCopying}
                                        className="placeholder:pl-2"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveInstruction(index)}
                                    disabled={instructions.length <= 1 || isCopying}
                                    className="mt-8"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <Button type="submit" size="lg" loading={loading}>
                        {isEditing
                            ? "Upravit recept"
                            : isCopying
                                ? "Zkopírovat recept"
                                : "Přidat recept"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddRecipePage;
