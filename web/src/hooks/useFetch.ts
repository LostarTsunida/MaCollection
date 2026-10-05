import { useCallback, useEffect, useState } from "react";
import type { DependencyList } from "react";
import { messageErreur } from "../services/client";

interface EtatFetch<T> {
  donnees: T | null;
  chargement: boolean;
  erreur: string | null;
  recharger: () => void;
}

// Gère les 3 états chargement / erreur / données pour un appel à l'API
export function useFetch<T>(charger: () => Promise<T>, deps: DependencyList): EtatFetch<T> {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [compteur, setCompteur] = useState(0);

  useEffect(() => {
    let annule = false; // évite de mettre à jour un composant démonté
    setChargement(true);
    setErreur(null);

    charger()
      .then((resultat) => {
        if (!annule) setDonnees(resultat);
      })
      .catch((e: unknown) => {
        if (!annule) setErreur(messageErreur(e));
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, compteur]);

  const recharger = useCallback(() => setCompteur((c) => c + 1), []);

  return { donnees, chargement, erreur, recharger };
}
