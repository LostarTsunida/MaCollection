import { Link } from "react-router-dom";
import { Chargement, EtatVide, MessageErreur } from "../components/Etats";
import { useCollection } from "../context/CollectionContext";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import type { ReactNode } from "react";
import Drapeau from "../components/Drapeau";
import { LIBELLES_STATUT, STATUTS } from "../utils/format";

interface BarreProps {
  libelle: ReactNode;
  valeur: number;
  total: number;
}

function Barre({ libelle, valeur, total }: BarreProps) {
  const pourcentage = total === 0 ? 0 : Math.round((valeur / total) * 100);
  return (
    <div className="barre">
      <div className="barre-libelle">
        <span>{libelle}</span>
        <span>
          {valeur} ({pourcentage} %)
        </span>
      </div>
      <div className="barre-fond">
        <div className="barre-remplie" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { entrees, favoris, likes } = useCollection();
  const { donnees: stats, chargement, erreur, recharger } = useFetch(() => api.stats(), [entrees]);

  if (chargement && !stats) return <Chargement />;
  if (erreur) return <MessageErreur message={erreur} onReessayer={recharger} />;
  if (!stats || stats.total === 0) {
    return (
      <EtatVide message="Pas encore de statistiques : ajoute des recettes à ta collection.">
        <Link className="bouton" to="/">
          Parcourir les recettes
        </Link>
      </EtatVide>
    );
  }

  // répartition par région calculée à partir de la collection chargée dans le contexte
  const parRegion = new Map<string, number>();
  for (const entree of entrees) {
    const region = entree.item.categorie;
    parRegion.set(region, (parRegion.get(region) ?? 0) + 1);
  }
  const regionsTriees = [...parRegion.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1>Mes statistiques</h1>

      <div className="chiffres">
        <div className="chiffre">
          <strong>{stats.total}</strong>
          <span>recettes dans ma collection</span>
        </div>
        <div className="chiffre">
          <strong>{stats.note_moyenne > 0 ? `${stats.note_moyenne.toFixed(1)} / 5` : "–"}</strong>
          <span>note moyenne</span>
        </div>
        <div className="chiffre">
          <strong>{favoris.length}</strong>
          <span>favoris</span>
        </div>
        <div className="chiffre">
          <strong>{likes.length}</strong>
          <span>likes donnés</span>
        </div>
      </div>

      <section className="bloc">
        <h2>Par statut</h2>
        {STATUTS.map((s) => (
          <Barre key={s} libelle={LIBELLES_STATUT[s]} valeur={stats.par_statut[s]} total={stats.total} />
        ))}
      </section>

      <section className="bloc">
        <h2>Par région</h2>
        {regionsTriees.map(([region, nombre]) => (
          <Barre key={region} libelle={<><Drapeau region={region} taille={16} /> {region}</>} valeur={nombre} total={entrees.length} />
        ))}
      </section>
    </div>
  );
}
