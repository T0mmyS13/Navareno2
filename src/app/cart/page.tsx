"use client";
import React, { useState } from "react";
import QRCode from "react-qr-code";
import { convertUnits, getDeclinedUnit } from "@/utils/units";

// Remove diacritics from text
const removeDiacritics = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

const CartPage: React.FC = () => {
  const [mergedIngredients, setMergedIngredients] = useState<Ingredient[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);

  // Merge ingredients (sum same items)
  const mergeIngredients = (ingredients: Ingredient[]): Ingredient[] => {
    const map = new Map<string, Ingredient>();
    ingredients.forEach(({ name, quantity, unit }) => {
      if (quantity == null) return;
      const key = `${name}-${unit}`;
      if (map.has(key)) {
        map.get(key)!.quantity += Number(quantity);
      } else {
        map.set(key, {
          name,
          quantity: Number(quantity),
          unit,
        });
      }
    });
    // Convert units after merging
    return Array.from(map.values()).map(({ name, quantity, unit }) => {
      const { quantity: convertedQuantity, unit: convertedUnit } = convertUnits(quantity, unit);
      return { name, quantity: convertedQuantity, unit: convertedUnit };
    });
  };

  // Load ingredients from localStorage
  const getIngredientsFromLocalStorage = (): Ingredient[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  };

  React.useEffect(() => {
    setMergedIngredients(mergeIngredients(getIngredientsFromLocalStorage()));
  }, []);

  // Clear cart
  const handleClearCart = () => {
    localStorage.removeItem("cart");
    setShowQRCode(false);
    setMergedIngredients([]);
  };

  // Print list
  const handlePrint = () => {
    window.print();
  };

  // Generate text for QR code (without diacritics)
  const generateShoppingListText = () => {
    const date = new Date().toLocaleDateString('cs-CZ');
    return `Nákupní seznam - ${date}\n\n` + mergedIngredients
      .map(item =>
        `${removeDiacritics(item.name)} ${item.quantity} ${removeDiacritics(getDeclinedUnit(item.unit, item.quantity))}`
      )
      .join("\n");
  };

  // Show QR code
  const handleGenerateQR = () => {
    setShowQRCode(true);
  };

  // Remove one item
  const handleRemoveItem = (index: number) => {
    const currentItems = getIngredientsFromLocalStorage();
    const itemToRemove = mergedIngredients[index];
    const updatedItems = currentItems.filter((item: Ingredient) =>
      !(item.name === itemToRemove.name && item.unit === itemToRemove.unit)
    );
    localStorage.setItem("cart", JSON.stringify(updatedItems));
    setMergedIngredients(mergeIngredients(updatedItems));
    if (updatedItems.length === 0) {
      setShowQRCode(false);
    }
  };

  return (
    <>
      <div className="max-w-[800px] mx-auto p-8 font-['Roboto'] bg-white rounded-[10px] shadow-lg shopping-list-container">
        <h1 className="text-center text-[#333] text-2xl mb-2 font-bold">Nákupní seznam</h1>
        {mergedIngredients.length === 0 ? (
          <p className="text-center text-gray-500">Seznam je prázdný.</p>
        ) : (
          <ul className="list-none p-0 my-4">
            {mergedIngredients.map((item, index) => (
              <li
                key={index}
                className="my-[0.6rem] text-[1.1rem] text-[#555] py-2 flex justify-between items-center border-b last:border-b-0 border-[#f0f0f0]"
              >
                <span className="font-bold flex-1 ingredient-name">{item.name}</span>
                <span className="ingredient-quantity text-base text-[#777] text-right ml-1 mr-1">{item.quantity}</span>
                <span className="ingredient-unit text-base text-[#777] text-right ml-1 mr-2">{getDeclinedUnit(item.unit, item.quantity)}</span>
                <button
                  className="remove-item-button bg-none border-none text-[#ff4444] cursor-pointer px-1 ml-2 text-sm hover:text-[#ff0000]"
                  onClick={() => handleRemoveItem(index)}
                  aria-label="Odebrat položku"
                  type="button"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        {mergedIngredients.length > 0 && (
          <div className="buttons-container flex flex-col gap-4 mt-6">
            <button
              onClick={handlePrint}
              className="w-full py-4 px-6 bg-green-600 text-white border-none cursor-pointer text-lg font-bold uppercase rounded-xl shadow-lg transition-all duration-300 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg"
              type="button"
            >
              Tisknout
            </button>
            <button
              onClick={handleGenerateQR}
              className="w-full py-4 px-6 bg-green-600 text-white border-none cursor-pointer text-lg font-bold uppercase rounded-xl shadow-lg transition-all duration-300 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg"
              type="button"
            >
              Vygeneruj QR kód
            </button>
            <button
              className="dump w-full py-4 px-6 bg-[#e53935] text-white border-none cursor-pointer text-lg font-bold uppercase rounded-xl shadow-lg transition-all duration-300 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg"
              onClick={handleClearCart}
              type="button"
            >
              Vysypat košík
            </button>
          </div>
        )}
        {showQRCode && (
          <div className="qr-code-container mt-8 flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCode value={generateShoppingListText()} size={256} />
            </div>
            <p className="text-center mt-2">Naskenuj mě!</p>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .shopping-list-container, .shopping-list-container * {
            visibility: visible !important;
          }
          .shopping-list-container {
            position: absolute !important;
            left: 0; top: 0; width: 100vw; min-height: 100vh;
            background: white !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          .shopping-list-container h1 {
            margin-top: 0.5em;
            margin-bottom: 1em;
            text-align: center;
          }
          .shopping-list-container ul {
            margin: 0;
            padding: 0;
          }
          .shopping-list-container li {
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            padding: 0.2em 0;
            font-size: 1.1em;
          }
          .ingredient-name, .ingredient-quantity, .ingredient-unit {
            color: #000 !important;
          }
          .buttons-container, .qr-code-container, .remove-item-button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CartPage;
