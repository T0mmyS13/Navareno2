// src/utils/timerUtils.ts

interface InstructionWithTimer {
  text: string;
  timer?: number;
}

/**
 * Analyzuje instrukce receptu a extrahuje časové údaje pro minutku
 * @param instructions Pole stringů s instrukcemi
 * @returns Pole objektů s původním textem a případně časem v minutách
 */
export function analyzeInstructionsForTimer(instructions: string[]): InstructionWithTimer[] {
  return instructions.map(instruction => {
    const timer = extractTimeFromInstruction(instruction);
    return {
      text: instruction,
      ...(timer && { timer })
    };
  });
}

/**
 * Extrahuje časový údaj z jedné instrukce
 * @param instruction Text instrukce
 * @returns Čas v minutách nebo null, pokud není nalezen
 */
export function extractTimeFromInstruction(instruction: string): number | null {
  // Normalizace textu - převod na malá písmena a odstranění diakritiky
  const normalizedText = instruction.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // odstranění diakritiky

  // Ignoruj teploty (např. 180 °c, 200 stupňů)
  if (/\b(\d{2,4})\s*(°c|stupnu|stupnů|stupne|stupně|celsius)\b/.test(normalizedText)) {
    return null;
  }
  // Ignoruj pořadí kroků, části, opakování (např. krok 1, 1. část, 2x)
  if (/\b(krok|část|cast|\d+x|\d+\.\s|\d+\.)\b/.test(normalizedText)) {
    return null;
  }

  // Povolené jednotky času
  const timeUnits = '(minut(?:a|y|ami)?|min|m)';
  // Povolené prefixy
  const approx = '(?:cca|asi|přibližně|priblizne)?';
  // Povolené spojky
  const rangeJoin = '(?:-|–|až|az|do|na)';

  // Rozsah: "20–25 minut", "5 až 7 min", "asi 30-35 minut", "cca 10 az 12 min"
  const rangePattern = new RegExp(`${approx}\\s*(\\d{1,3}(?:[.,]\d+)?)\\s*${rangeJoin}\\s*(\\d{1,3}(?:[.,]\d+)?)\\s*${timeUnits}`);
  // Jednoduchý čas: "10 minut", "na 15 minut", "cca 5 min", "asi 7 minutami"
  const singlePattern = new RegExp(`${approx}\\s*(?:na\\s*)?(\\d{1,3}(?:[.,]\d+)?)\\s*${timeUnits}`);

  // Nejprve zkus rozsah
  const rangeMatch = normalizedText.match(rangePattern);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1].replace(',', '.'));
    const max = parseFloat(rangeMatch[2].replace(',', '.'));
    return Math.round(((min + max) / 2) * 10) / 10;
  }
  // Pak zkus jednoduchý čas
  const singleMatch = normalizedText.match(singlePattern);
  if (singleMatch) {
    return parseFloat(singleMatch[1].replace(',', '.'));
  }

  // Pokud nic nenalezeno, vrať null
  return null;
}

/**
 * Formátuje čas pro zobrazení
 * @param minutes Čas v minutách
 * @returns Formátovaný čas jako string
 */
export function formatTimerDisplay(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`;
  } else if (minutes === Math.floor(minutes)) {
    return `${Math.floor(minutes)}m`;
  } else {
    const wholeMinutes = Math.floor(minutes);
    const seconds = Math.round((minutes - wholeMinutes) * 60);
    return `${wholeMinutes}m ${seconds}s`;
  }
}

/**
 * Spustí minutku s daným časem
 * @param minutes Čas v minutách
 * @param onTick Callback volaný každou sekundu
 * @param onComplete Callback volaný po dokončení
 */
export function startTimer(
  minutes: number,
  onTick: (remainingSeconds: number) => void,
  onComplete: () => void
): () => void {
  const totalSeconds = Math.round(minutes * 60);
  let remainingSeconds = totalSeconds;
  let intervalId: NodeJS.Timeout | null = null;

  const tick = () => {
    if (remainingSeconds <= 0) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      onComplete();
      return;
    }

    onTick(remainingSeconds);
    remainingSeconds--;
  };

  // Spustit první tick okamžitě
  tick();
  
  // Nastavit interval pro další ticky
  intervalId = setInterval(tick, 1000);

  // Vrátit funkci pro zastavení časovače
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
} 