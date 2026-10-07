import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../context/CollectionContext";
import { messageErreur } from "../services/client";
import type { Item } from "../types/api";

interface BoutonFavoriProps {
  item: Item;
  avecTexte?: boolean;
}

export default function BoutonFavori({ item, avecTexte = false }: BoutonFavoriProps) {
  const { token } = useAuth();
  const { estFavori, basculerFavori } = useCollection();
  const navigate = useNavigate();
  const [occupe, setOccupe] = useState(false);
  const favori = estFavori(item.id);

  async function cliquer() {
    if (!token) {
      navigate("/login");
      return;
    }
    setOccupe(true);
    try {
      await basculerFavori(item);
    } catch (e) {
      alert(messageErreur(e));
    } finally {
      setOccupe(false);
    }
  }

  return (
    <button
      type="button"
      className={favori ? "bouton-icone favori actif" : "bouton-icone favori"}
      onClick={cliquer}
      disabled={occupe}
      aria-pressed={favori}
      title={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {favori ? "♥" : "♡"}
      {avecTexte && <span>{favori ? " Dans mes favoris" : " Ajouter aux favoris"}</span>}
    </button>
  );
}
