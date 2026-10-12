import { useEffect, useState } from "react";

// Renvoie la valeur seulement quand elle n'a pas changé depuis "delai" ms
export function useDebounce<T>(valeur: T, delai = 400): T {
  const [valeurRetardee, setValeurRetardee] = useState<T>(valeur);

  useEffect(() => {
    const timer = setTimeout(() => setValeurRetardee(valeur), delai);
    return () => clearTimeout(timer);
  }, [valeur, delai]);

  return valeurRetardee;
}
