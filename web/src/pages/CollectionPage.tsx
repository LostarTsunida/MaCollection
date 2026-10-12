import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import EntreeCard from "../components/EntreeCard";
import { Chargement, EtatVide, MessageErreur } from "../components/Etats";
import { useCollection } from "../context/CollectionContext";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import type { Statut, Tri } from "../types/api";
import { LIBELLES_STATUT, STATUTS } from "../utils/format";

export default function CollectionPage() {
  const { entrees, chargement: chargementCollection } = useCollection();
  const [statut, setStatut] = useState<Statut | "">("");
  const [tri, setTri] = useState<Tri>("date");

  // on redemande la liste filtrée à l'API à chaque changement de filtre
  // ou quand la collection change (ajout, modification, suppression)
  const { donnees, chargement, erreur, recharger } = useFetch(
    () => api.collection(statut || undefined, tri),
    [statut, tri, entrees],
  );

  let contenu: ReactNode;
  if ((chargement && !donnees) || chargementCollection) contenu = <Chargement />;
  else if (erreur) contenu = <MessageErreur message={erreur} onReessayer={recharger} />;
  else if (statut === "" && donnees && donnees.length === 0)
    contenu = (
      <EtatVide message="Ta collection est vide pour l'instant.">
        <Link className="bouton" to="/">
          Parcourir les recettes
        </Link>
      </EtatVide>
    );
  else if (!donnees || donnees.length === 0)
    contenu = <EtatVide message="Aucune recette avec ce statut." />;
  else
    contenu = (
      <div className="liste">
        {donnees.map((entree) => (
          <EntreeCard key={entree.id} entree={entree} />
        ))}
      </div>
    );

  return (
    <div>
      <h1>Ma collection</h1>

      <div className="barre-filtres">
        <div className="puces" role="group" aria-label="Filtrer par statut">
          <button className={statut === "" ? "puce active" : "puce"} onClick={() => setStatut("")}>
            Toutes
          </button>
          {STATUTS.map((s) => (
            <button key={s} className={statut === s ? "puce active" : "puce"} onClick={() => setStatut(s)}>
              {LIBELLES_STATUT[s]}
            </button>
          ))}
        </div>

        <label className="tri">
          Trier par
          <select value={tri} onChange={(e) => setTri(e.target.value === "note" ? "note" : "date")}>
            <option value="date">Date d'ajout</option>
            <option value="note">Note</option>
          </select>
        </label>
      </div>

      {contenu}
    </div>
  );
}
