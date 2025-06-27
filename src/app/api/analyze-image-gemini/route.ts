import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { error: "Obrázek je povinný" },
                { status: 400 }
            );
        }

        // Remove data:image/jpeg;base64, prefix if present
        const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Jsi expert na vaření a analýzu potravin. Analyzuj obrázek jídla a vytvoř detailní recept v JSON formátu. 
        
        Odpověď musí být vždy platný JSON objekt s následující strukturou:
        {
            "title": "Název jídla",
            "description": "Krátký popis jídla (max 200 znaků)",
            "category": "predkrmy|polevky|salaty|hlavni-chody|dezerty|napoje",
            "difficulty": 1-3 (1=snadné, 2=střední, 3=obtížné),
            "time": "čas v minutách",
            "portion": "počet porcí",
            "ingredients": [
                {
                    "name": "název ingredience",
                    "quantity": "množství",
                    "unit": "jednotka (g, kg, ml, l, ks, lžička, lžíce, hrst, plátek, stroužek, konzerva, špetka)"
                }
            ],
            "instructions": [
                "krok 1",
                "krok 2",
                "krok 3"
            ]
        }
        
        Pravidla:
        - Používej pouze české názvy
        - Kategorie musí být jedna z: predkrmy, polevky, salaty, hlavni-chody, dezerty, napoje
        - Jednotky musí být z předem definovaného seznamu
        - Čas a porce musí být čísla
        - Složitost 1-3 podle náročnosti
        - Pokud nevidíš jasně ingredience, odhadni podle vzhledu jídla
        - Postup musí být logický a postupný
        - Odpověď musí být pouze JSON, žádný další text`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            }
        ]);

        const response = await result.response;
        const content = response.text();
        
        if (!content) {
            throw new Error("Žádná odpověď od AI");
        }

        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Neplatná odpověď od AI");
        }

        const recipeData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        const requiredFields = ['title', 'description', 'category', 'difficulty', 'time', 'portion', 'ingredients', 'instructions'];
        for (const field of requiredFields) {
            if (!recipeData[field]) {
                throw new Error(`Chybí povinné pole: ${field}`);
            }
        }

        return NextResponse.json(recipeData);

    } catch (error) {
        console.error("Chyba při analýze obrázku:", error);
        return NextResponse.json(
            { error: "Chyba při analýze obrázku. Zkuste to prosím znovu." },
            { status: 500 }
        );
    }
} 