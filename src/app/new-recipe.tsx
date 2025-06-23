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

const AddRecipePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [originalTitle, setOriginalTitle] = useState("");
    const { showToast } = useToast();
    const router = useRouter();

    const loadEditingData = () => {
        const editingRecipeData = sessionStorage.getItem("editingRecipe");
        if (editingRecipeData) {
            const editingRecipe = JSON.parse(editingRecipeData);
            sessionStorage.removeItem("editingRecipe");
            setIsEditing(true);
            setOriginalTitle(editingRecipe.title);
            return editingRecipe;
        }
        const copyingRecipeData = sessionStorage.getItem("copyingRecipe");
        if (copyingRecipeData) {
            const copyingRecipe = JSON.parse(copyingRecipeData);
            sessionStorage.removeItem("copyingRecipe");
            setIsCopying(true);
            return { ...copyingRecipe, title: "" };
        }
        return null;
    };

    const editingRecipe = loadEditingData();

    const [title, setTitle] = useState(editingRecipe?.title || "");
    const [description, setDescription] = useState(editingRecipe?.description || "");
    const [image, setImage] = useState(editingRecipe?.image || "");
    const [portion, setPortion] = useState(editingRecipe?.portion || "");
    const [time, setTime] = useState(editingRecipe?.time || "");
    const [instructions, setInstructions] = useState<string[]>(editingRecipe?.instructions || [""]);
    const [ingredients, setIngredients] = useState(editingRecipe?.ingredients || [{ name: "", quantity: "", unit: "" }]);
    const [selectedCategory, setSelectedCategory] = useState(editingRecipe?.category || "");
    const [difficulty, setDifficulty] = useState(editingRecipe?.difficulty || "");

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngredients = [...ingredients];
        newIngredients.splice(index, 1);
        setIngredients(newIngredients);
    };

    const handleAddInstruction = () => {
        setInstructions([...instructions, ""]);
    };

    const handleRemoveInstruction = (index: number) => {
        const newInstructions = [...instructions];
        newInstructions.splice(index, 1);
        setInstructions(newInstructions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || title.trim().length < 5) {
            showToast("Název receptu musí mít alespoň 5 znaků", "error");
            return;
        }
        if (!description.trim() || description.trim().length < 10) {
            showToast("Popis musí mít alespoň 10 znaků", "error");
            return;
        }
        if (ingredients.length === 0 || ingredients.every(ing => !ing.name.trim())) {
            showToast("Musí být zadána alespoň jedna ingredience s názvem", "error");
            return;
        }
        if (ingredients.some(ing => isNaN(ing.quantity) || ing.quantity <= 0 || !ing.unit)) {
            showToast("Množství u všech ingrediencí musí být platné číslo větší než 0 a musí být vyplněna jednotka", "error");
            return;
        }
        if (instructions.length === 0 || instructions.every(instr => !instr.trim())) {
            showToast("Musí být zadán alespoň jeden krok postupu", "error");
            return;
        }
        if (!portion || isNaN(Number(portion)) || Number(portion) < 1) {
            showToast("Počet porcí musí být číslo větší než 0", "error");
            return;
        }

        const normalizedCategory = selectedCategory
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/\s+/g, "-");

        const storedRecipes = JSON.parse(localStorage.getItem(normalizedCategory) || "[]");
        let updatedRecipes = storedRecipes;

        if (isEditing) {
            updatedRecipes = storedRecipes.filter((recipe: any) => recipe.title !== originalTitle);
        }

        const isDuplicate = updatedRecipes.some((recipe: any) => recipe.title === title);
        if (isDuplicate) {
            showToast(`Recept pod názvem ${title} už existuje`, "error");
            return;
        }

        const newRecipe = {
            title,
            description,
            ingredients,
            instructions,
            time,
            difficulty,
            image,
            portion,
            rating: null,
        };

        updatedRecipes.push(newRecipe);
        localStorage.setItem(normalizedCategory, JSON.stringify(updatedRecipes));
        showToast(
            isEditing ? "Úprava úspěšná" : isCopying ? "Recept zkopírován" : "Recept přidán",
            "success"
        );

        router.push(`/${normalizedCategory}/${encodeURIComponent(title)}`);
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
                    {image && <img src={image} alt="náhled" className="rounded w-full h-48 object-cover mb-4" />}
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
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <TextField
                                label="Ingredience"
                                value={ingredient.name}
                                onChange={(e) => setIngredients(
                                    ingredients.map((ing, i) =>
                                        i === index ? { ...ing, name: e.target.value } : ing
                                    )
                                )}
                                disabled={isCopying}
                            />
                            <TextField
                                label="Množství"
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) => setIngredients(
                                    ingredients.map((ing, i) =>
                                        i === index ? { ...ing, quantity: e.target.value } : ing
                                    )
                                )}
                                disabled={isCopying}
                            />
                            <Autocomplete
                                options={["g", "kg", "ml", "l", "ks", "lžička", "lžíce", "hrst", "plátek", "stroužek", "konzerva"]}
                                value={ingredient.unit}
                                onChange={(e, newValue) => setIngredients(
                                    ingredients.map((ing, i) =>
                                        i === index ? { ...ing, unit: newValue } : ing
                                    )
                                )}
                                renderInput={(params) => <TextField {...params} label="Jednotka" />}
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
                    <Button variant="outlined" onClick={handleAddIngredient} startIcon={<Add />} disabled={isCopying}>
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
                                onChange={(e) => setInstructions(
                                    instructions.map((instr, i) =>
                                        i === index ? e.target.value : instr
                                    )
                                )}
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
                    <Button variant="outlined" onClick={handleAddInstruction} startIcon={<Add />} disabled={isCopying}>
                        Přidat krok
                    </Button>
                </div>

                <div className="text-center">
                    <Button variant="contained" type="submit">
                        {isEditing ? "Upravit recept" : isCopying ? "Zkopírovat recept" : "Přidat recept"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddRecipePage;