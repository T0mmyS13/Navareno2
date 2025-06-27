# Google Gemini AI - Nastavení (ZDARMA)

## Přehled
Aplikace nyní používá Google Gemini AI pro analýzu obrázků jídla. Tato služba je **ZDARMA** a nevyžaduje platební kartu!

## ✅ Výhody Google Gemini:
- **100% ZDARMA** - žádné poplatky
- **15 požadavků za minutu** zdarma
- **Neomezené použití** denně
- **Žádná platební karta** potřeba
- **Výborná analýza obrázků** s Gemini 2.5 Flash
- **Přesnější identifikace ingrediencí**
- **Lepší JSON výstup**

## 🔧 Nastavení

### 1. Získání Google Gemini API klíče
1. Jděte na [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Přihlaste se pomocí Google účtu
3. Klikněte na "Create API Key"
4. Zkopírujte klíč

### 2. Nastavení environment proměnných

#### Lokální vývoj
V souboru `.env.development.local` nahraďte:
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```
za:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyC-your-actual-gemini-key-here
```

#### Produkce (Vercel)
1. Jděte do Vercel dashboardu vašeho projektu
2. Přejděte na Settings > Environment Variables
3. Přidejte proměnnou:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: `AIzaSyC-your-actual-gemini-key-here`
4. Uložte a redeployujte aplikaci

### 3. Použití funkce
1. Jděte na stránku "Přidat nový recept"
2. Nahrajte obrázek jídla
3. Klikněte na tlačítko "AI Analýza"
4. Počkejte na analýzu (obvykle 3-5 sekund)
5. Formulář bude automaticky předvyplněn
6. Zkontrolujte a případně upravte data
7. Uložte recept


## 🎯 Jak to funguje

1. **Nahrání obrázku**: Uživatel nahraje fotku jídla
2. **AI Analýza**: Obrázek se pošle na Google Gemini API
3. **Analýza**: AI analyzuje obrázek a identifikuje:
   - Typ jídla
   - Ingredience (podle vzhledu)
   - Odhadovaný čas přípravy
   - Počet porcí
   - Složitost
   - Kategorii
4. **Předvyplnění**: Data se automaticky vloží do formuláře
5. **Úprava**: Uživatel může data zkontrolovat a upravit

## 📊 Omezení
- **15 požadavků za minutu** (dostatečné pro většinu uživatelů)
- **Maximální velikost obrázku**: 4MB
- **Podporované formáty**: JPEG, PNG, WebP, GIF

## 💰 Náklady
- **ZDARMA** - žádné poplatky
- **Neomezené použití** denně
- **Žádné skryté poplatky**

## 🔒 Bezpečnost
- API klíč je uložen pouze na serveru
- Obrázky se neukládají trvale
- Analýza probíhá pouze při požadavku uživatele

## 🐛 Řešení problémů

### Chyba "Invalid API key"
- Zkontrolujte, zda je správně nastaven GOOGLE_GEMINI_API_KEY
- Ověřte, zda klíč začíná `AIzaSyC`
- Zkuste vytvořit nový klíč

### Chyba "Quota exceeded"
- Počkejte 1 minutu a zkuste znovu
- Máte limit 15 požadavků za minutu

### Pomalá analýza
- Zmenšete velikost obrázku
- Použijte JPEG formát
- Zkontrolujte připojení k internetu

## 🎉 Výhody pro uživatele

- **Žádné poplatky** - funkce je 100% zdarma
- **Okamžité použití** - žádná registrace platební karty
- **Spolehlivost** - Google infrastruktura
- **Kvalita** - výborné výsledky analýzy 