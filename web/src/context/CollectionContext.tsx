import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import { messageErreur } from "../services/client";
import { useAuth } from "./AuthContext";
import type { Entry, EntryCreate, EntryUpdate, Item } from "../types/api";

interface CollectionContextValeur {
  entrees: Entry[];
  favoris: Item[];
  likes: number[];
  chargement: boolean;
  erreur: string | null;
  recharger: () => void;
  entreePour: (itemId: number) => Entry | undefined;
  ajouterEntree: (entree: EntryCreate) => Promise<void>;
  modifierEntree: (id: number, modif: EntryUpdate) => Promise<void>;
  supprimerEntree: (id: number) => Promise<void>;
  estFavori: (itemId: number) => boolean;
  basculerFavori: (item: Item) => Promise<void>;
  aLike: (itemId: number) => boolean;
  basculerLike: (itemId: number) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValeur | null>(null);

interface CollectionProviderProps {
  children: ReactNode;
}

export function CollectionProvider({ children }: CollectionProviderProps) {
  const { utilisateur, chargement: chargementAuth } = useAuth();
  const [entrees, setEntrees] = useState<Entry[]>([]);
  const [favoris, setFavoris] = useState<Item[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [compteur, setCompteur] = useState(0);

  // on recharge quand l'utilisateur se connecte / se déconnecte, ou quand on appelle recharger()
  useEffect(() => {
    if (!utilisateur) {
      setEntrees([]);
      setFavoris([]);
      setLikes([]);
      return;
    }
    let annule = false;
    setChargement(true);
    setErreur(null);
    Promise.all([api.collection(), api.favoris(), api.mesLikes()])
      .then(([listeEntrees, listeFavoris, listeLikes]) => {
        if (annule) return;
        setEntrees(listeEntrees);
        setFavoris(listeFavoris);
        setLikes(listeLikes);
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
  }, [utilisateur, compteur]);

  const recharger = useCallback(() => setCompteur((c) => c + 1), []);

  const entreePour = (itemId: number) => entrees.find((e) => e.item.id === itemId);

  async function ajouterEntree(entree: EntryCreate) {
    const nouvelle = await api.ajouterEntree(entree);
    setEntrees((anciennes) => [nouvelle, ...anciennes]);
  }

  async function modifierEntree(id: number, modif: EntryUpdate) {
    const modifiee = await api.modifierEntree(id, modif);
    setEntrees((anciennes) => anciennes.map((e) => (e.id === id ? modifiee : e)));
  }

  async function supprimerEntree(id: number) {
    await api.supprimerEntree(id);
    setEntrees((anciennes) => anciennes.filter((e) => e.id !== id));
  }

  const estFavori = (itemId: number) => favoris.some((f) => f.id === itemId);

  async function basculerFavori(item: Item) {
    if (estFavori(item.id)) {
      await api.retirerFavori(item.id);
      setFavoris((anciens) => anciens.filter((f) => f.id !== item.id));
    } else {
      await api.ajouterFavori(item.id);
      setFavoris((anciens) => [item, ...anciens]);
    }
  }

  const aLike = (itemId: number) => likes.includes(itemId);

  async function basculerLike(itemId: number) {
    if (aLike(itemId)) {
      await api.retirerLike(itemId);
      setLikes((anciens) => anciens.filter((id) => id !== itemId));
    } else {
      await api.liker(itemId);
      setLikes((anciens) => [...anciens, itemId]);
    }
  }

  const valeur: CollectionContextValeur = {
    entrees, favoris, likes, erreur, recharger,
    chargement: chargement || chargementAuth,
    entreePour, ajouterEntree, modifierEntree, supprimerEntree,
    estFavori, basculerFavori, aLike, basculerLike,
  };
  return <CollectionContext.Provider value={valeur}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValeur {
  const contexte = useContext(CollectionContext);
  if (contexte === null) {
    throw new Error("useCollection doit être utilisé à l'intérieur de <CollectionProvider>");
  }
  return contexte;
}
