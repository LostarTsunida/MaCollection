import { Link } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";
import type { Item } from "../types/api";
import { LIBELLES_DIFFICULTE, formatDuree } from "../utils/format";
import { classeTheme } from "../utils/regions";
import BoutonFavori from "./BoutonFavori";
import Drapeau from "./Drapeau";
import RecetteImage from "./RecetteImage";
import StatutBadge from "./StatutBadge";

export default function ItemCard({ item }: { item: Item }) {
  const { entreePour } = useCollection();
  const entree = entreePour(item.id);

  return (
    <article className={`carte ${classeTheme(item.categorie)}`}>
      <Link to={`/recettes/${item.id}`} className="carte-lien">
        <RecetteImage item={item} className="carte-image" />
        <div className="carte-contenu">
          <p className="carte-region">
            <Drapeau region={item.categorie} taille={16} /> {item.categorie}
          </p>
          <h3>{item.titre}</h3>
          <p className="carte-infos">
            ⏱ {formatDuree(item.temps_preparation)} · {LIBELLES_DIFFICULTE[item.difficulte]}
          </p>
          {entree && <StatutBadge statut={entree.statut} />}
        </div>
      </Link>
      <div className="carte-favori">
        <BoutonFavori item={item} />
      </div>
    </article>
  );
}
