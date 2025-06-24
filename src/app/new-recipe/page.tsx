"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    TextField,
    Button,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Autocomplete,
    Box,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import ImageIcon from "@mui/icons-material/Image";
import { useToast } from "@/utils/ToastNotify";
import Image from "next/image";

interface Ingredient {
    name: string;
    quantity: string; // držíme string, protože input vrací string
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
    const [difficulty, setDifficulty] = useState<number | "">("");

    const { showToast } = useToast();
    const router = useRouter();

    // načti data z sessionStorage jen jednou při mountu
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

            setTitle(""); // nové pole musí mít prázdný title
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || title.trim().length < 5) {
            showToast("Název receptu musí mít alespoň 5 znaků", "error");
            return;
        }
        if (!description.trim() || description.trim().length < 10) {
            showToast("Popis musí mít alespoň 10 znaků", "error");
            return;
        }
        if (ingredients.length === 0 || ingredients.every((ing) => !ing.name.trim())) {
            showToast("Musí být zadána alespoň jedna ingredience s názvem", "error");
            return;
        }
        if (
            ingredients.some(
                (ing) =>
                    isNaN(Number(ing.quantity)) ||
                    Number(ing.quantity) <= 0 ||
                    !ing.unit ||
                    ing.unit === ""
            )
        ) {
            showToast(
                "Množství u všech ingrediencí musí být platné číslo větší než 0 a musí být vyplněna jednotka",
                "error"
            );
            return;
        }
        if (instructions.length === 0 || instructions.every((instr) => !instr.trim())) {
            showToast("Musí být zadán alespoň jeden krok postupu", "error");
            return;
        }
        if (!portion || isNaN(Number(portion)) || Number(portion) < 1) {
            showToast("Počet porcí musí být číslo větší než 0", "error");
            return;
        }

        // Vygeneruj slug z názvu receptu
        const slug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[^a-z0-9 ]/g, "")
            .replace(/\s+/g, "-");

        const newRecipe = {
            title,
            description,
            ingredients: ingredients.map((ing) => ({
                name: ing.name.trim(),
                quantity: Number(ing.quantity),
                unit: ing.unit,
            })),
            instructions: instructions.map((instr) => instr.trim()),
            time,
            difficulty: Number(difficulty),
            image,
            portion,
            category: selectedCategory,
            slug,
        };

        try {
            const response = await fetch("/api/recipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRecipe),
            });

            if (!response.ok) {
                throw new Error("Failed to add recipe");
            }

            showToast("Recept úspěšně přidán", "success");
            router.push(`/${selectedCategory}/${slug}`);
        } catch (error) {
            console.error(error);
            showToast("Chyba při přidávání receptu", "error");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        label="Název receptu"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                        disabled={isEditing}
                        error={(isEditing || isCopying) && !title}
                        helperText={
                            isEditing
                                ? "Název receptu nelze při úpravě změnit"
                                : isCopying
                                    ? "Zadejte nový název pro kopírovaný recept"
                                    : "Zadejte název receptu"
                        }
                    />
                    <FormControl fullWidth required>
                        <InputLabel id="category-label">Kategorie</InputLabel>
                        <Select
                            labelId="category-label"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={isEditing || isCopying}
                            label="Kategorie"
                        >
                            <MenuItem value="predkrmy">Předkrmy</MenuItem>
                            <MenuItem value="polevky">Polévky</MenuItem>
                            <MenuItem value="salaty">Saláty</MenuItem>
                            <MenuItem value="hlavni-chody">Hlavní chody</MenuItem>
                            <MenuItem value="dezerty">Dezerty</MenuItem>
                            <MenuItem value="napoje">Nápoje</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <Box>
                    {image && (
                        <Image
                            src={image}
                            alt="náhled"
                            className="rounded w-full h-48 object-cover mb-4"
                            width={600}
                            height={192}
                            style={{ objectFit: 'cover' }}
                        />
                    )}
                    <Box display="flex" alignItems="center" gap={2}>
                        <TextField
                            label="Odkaz na obrázek"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            fullWidth
                            disabled={isCopying}
                        />
                        <input
                            accept="image/*"
                            id="upload-image"
                            type="file"
                            style={{ display: "none" }}
                            disabled={isCopying}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        setImage(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <label htmlFor="upload-image">
                            <IconButton component="span" color="primary">
                                <ImageIcon />
                            </IconButton>
                        </label>
                    </Box>
                </Box>

                <div className="space-y-6" >
                    <TextField
                        label="Krátký popis"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        inputProps={{ maxLength: 200 }}
                        required
                        disabled={isCopying}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <TextField
                        label="Čas (minuty)"
                        type="number"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                        fullWidth
                        disabled={isCopying}
                    />
                    <TextField
                        label="Počet porcí"
                        type="number"
                        value={portion}
                        onChange={(e) => setPortion(e.target.value)}
                        required
                        fullWidth
                        disabled={isCopying}
                    />
                    <FormControl fullWidth required>
                        <InputLabel id="difficulty-label">Složitost</InputLabel>
                        <Select
                            labelId="difficulty-label"
                            value={difficulty}
                            label="Složitost"
                            disabled={isCopying}
                            onChange={(e) => setDifficulty(Number(e.target.value))}
                        >
                            <MenuItem value={1}>Snadné</MenuItem>
                            <MenuItem value={2}>Střední</MenuItem>
                            <MenuItem value={3}>Obtížné</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <div className="space-y-4">
                    <Typography variant="h6">Ingredience</Typography>
                    {ingredients.map((ingredient, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                        >
                            <TextField
                                label="Ingredience"
                                value={ingredient.name}
                                onChange={(e) =>
                                    setIngredients((prev) =>
                                        prev.map((ing, i) =>
                                            i === index ? { ...ing, name: e.target.value } : ing
                                        )
                                    )
                                }
                                disabled={isCopying}
                            />
                            <TextField
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
                                disabled={isCopying}
                            />
                            <Autocomplete
                                options={[
                                    "g",
                                    "kg",
                                    "ml",
                                    "l",
                                    "ks",
                                    "lžička",
                                    "lžíce",
                                    "hrst",
                                    "plátek",
                                    "stroužek",
                                    "konzerva",
                                ]}
                                value={ingredient.unit}
                                onChange={(e, newValue) =>
                                    setIngredients((prev) =>
                                        prev.map((ing, i) =>
                                            i === index ? { ...ing, unit: newValue } : ing
                                        )
                                    )
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Jednotka" />
                                )}
                                disabled={isCopying}
                            />
                            <IconButton
                                onClick={() => handleRemoveIngredient(index)}
                                disabled={ingredients.length <= 1 || isCopying}
                                color="error"
                            >
                                <Remove />
                            </IconButton>
                        </div>
                    ))}
                    <Button
                        variant="outlined"
                        onClick={handleAddIngredient}
                        startIcon={<Add />}
                        disabled={isCopying}
                    >
                        Přidat ingredienci
                    </Button>
                </div>

                <div className="space-y-4">
                    <Typography variant="h6">Postup</Typography>
                    {instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <TextField
                                label={`Krok ${index + 1}`}
                                multiline
                                rows={3}
                                value={instruction}
                                onChange={(e) =>
                                    setInstructions((prev) =>
                                        prev.map((instr, i) => (i === index ? e.target.value : instr))
                                    )
                                }
                                fullWidth
                                disabled={isCopying}
                            />
                            <IconButton
                                onClick={() => handleRemoveInstruction(index)}
                                disabled={instructions.length <= 1 || isCopying}
                                color="error"
                            >
                                <Remove />
                            </IconButton>
                        </div>
                    ))}
                    <Button
                        variant="outlined"
                        onClick={handleAddInstruction}
                        startIcon={<Add />}
                        disabled={isCopying}
                    >
                        Přidat krok
                    </Button>
                </div>

                <div className="text-center">
                    <Button variant="contained" type="submit">
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
