import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../context/CollectionContext";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { messageErreur } from "../services/client";

export default function BoutonLike({ itemId }: { itemId: number }) {
  const { token } = useAuth();
  const { aLike, basculerLike } = useCollection();
  const navigate = useNavigate();
  const { donnees, chargement, erreur, recharger } = useFetch(() => api.likesItem(itemId), [itemId]);
  const [occupe, setOccupe] = useState(false);
  const like = aLike(itemId);

  async function cliquer() {
    if (!token) {
      navigate("/login");
      return;
    }
    setOccupe(true);
    try {
      await basculerLike(itemId);
      recharger();
    } catch (e) {
      alert(messageErreur(e));
    } finally {
      setOccupe(false);
    }
  }

  let compteur = "…";
  if (erreur) compteur = "?";
  else if (!chargement && donnees) compteur = String(donnees.total);

  return (
    <button
      type="button"
      className={like ? "bouton-icone like actif" : "bouton-icone like"}
      onClick={cliquer}
      disabled={occupe}
      aria-pressed={like}
      title={like ? "Retirer mon like" : "J'aime cette recette"}
    >
      👍 <span>{compteur}</span>
    </button>
  );
}
