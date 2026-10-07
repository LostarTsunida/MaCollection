import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import Drapeau from "./Drapeau";
import { Chargement, EtatVide, MessageErreur } from "./Etats";
import RecetteImage from "./RecetteImage";

export default function Populaires() {
  const { donnees, chargement, erreur, recharger } = useFetch(() => api.populaires(), []);

  let contenu: ReactNode;
  if (chargement) contenu = <Chargement texte="Chargement des recettes populaires..." />;
  else if (erreur) contenu = <MessageErreur message={erreur} onReessayer={recharger} />;
  else if (!donnees || donnees.length === 0)
    contenu = <EtatVide message="Aucune recette likée pour l'instant. Sois le premier !" />;
  else
    contenu = (
      <div className="populaires-liste">
        {donnees.map(({ item, likes }) => (
          <Link key={item.id} to={`/recettes/${item.id}`} className="populaire">
            <RecetteImage item={item} className="populaire-image" />
            <div>
              <strong>{item.titre}</strong>
              <p className="texte-discret">
                <Drapeau region={item.categorie} taille={16} /> · 👍 {likes}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );

  return (
    <section className="populaires">
      <h2>Les plus aimées</h2>
      {contenu}
    </section>
  );
}
