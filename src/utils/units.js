const unitDeclensions = {
    "lžíce": ["lžíce", "lžíce", "lžic"],
    "lžička": ["lžička", "lžičky", "lžiček"],
    "hrst": ["hrst", "hrsti", "hrstí"],
    "plátek": ["plátek", "plátky", "plátků"],
    "stroužek": ["stroužek", "stroužky", "stroužků"],
    "konzerva": ["konzerva", "konzervy", "konzerv"],
    "lístek": ["lístek", "lístky", "lístků"],
    "kulička": ["kulička", "kuličky", "kuliček"],
    "hrnek": ["hrnek", "hrnky", "hrnků"],
    "špetka": ["špetka", "špetky", "špetek"],
};

// Jednotky, které nevyžadují množství
const unitsWithoutQuantity = ["špetka"];

export const getDeclinedUnit = (unit, quantity) => {
    const forms = unitDeclensions[unit];
    if (!forms) return unit;

    // Pokud je jednotka v seznamu jednotek bez množství, vrátíme základní tvar
    if (unitsWithoutQuantity.includes(unit)) {
        return forms[0];
    }

    if (quantity === 1) return forms[0];         // 1 kus
    if (quantity < 5) return forms[1];           // 2–4 kusy
    return forms[2];                             // 5 a více kusů
};
export const convertUnits = (quantity, unit) => {
    if (unit === "ml" && quantity >= 1000) {
        return { quantity: quantity / 1000, unit: "l" };
    }
    if (unit === "g" && quantity >= 1000) {
        return { quantity: quantity / 1000, unit: "kg" };
    }
    return { quantity, unit };
};