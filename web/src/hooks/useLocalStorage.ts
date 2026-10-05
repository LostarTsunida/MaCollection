import { useCallback, useState } from "react";

export function useLocalStorage<T>(cle: string, valeurInitiale: T): [T, (v: T) => void] {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const brut = localStorage.getItem(cle);
      return brut !== null ? (JSON.parse(brut) as T) : valeurInitiale;
    } catch {
      return valeurInitiale;
    }
  });

  const modifier = useCallback(
    (nouvelleValeur: T) => {
      setValeur(nouvelleValeur);
      try {
        localStorage.setItem(cle, JSON.stringify(nouvelleValeur));
      } catch {
        // localStorage indisponible (navigation privée...) : on garde juste le state
      }
    },
    [cle],
  );

  return [valeur, modifier];
}
