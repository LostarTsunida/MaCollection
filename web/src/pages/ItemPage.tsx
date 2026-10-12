import { Link, useNavigate, useParams } from "react-router-dom";
import BoutonFavori from "../components/BoutonFavori";
import BoutonLike from "../components/BoutonLike";
import Drapeau from "../components/Drapeau";
import { Chargement, EtatVide, MessageErreur } from "../components/Etats";
import FicheRecette from "../components/FicheRecette";
import RecetteImage from "../components/RecetteImage";
import RegionBanniere from "../components/RegionBanniere";
import SectionCollection from "../components/SectionCollection";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { LIBELLES_DIFFICULTE, formatDuree } from "../utils/format";
import { classeTheme } from "../utils/regions";

export default function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const itemId = Number(id);
  const idValide = Number.isInteger(itemId) && itemId > 0;

  const { donnees: item, chargement, erreur, recharger } = useFetch(
    () => (idValide ? api.item(itemId) : Promise.reject(new Error("Recette introuvable"))),
    [itemId],
  );

  if (chargement) return <Chargement />;
  if (erreur) {
    return (
      <div>
        <MessageErreur message={erreur} onReessayer={idValide ? recharger : undefined} />
        <p className="centre">
          <Link to="/">← Retour aux recettes</Link>
        </p>
      </div>
    );
  }
  if (!item) return <EtatVide message="Recette introuvable" />;

  return (
    <div className={`fiche ${classeTheme(item.categorie)}`}>
      <button className="lien-retour" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <RegionBanniere region={item.categorie} />

      <div className="fiche-haut">
        <RecetteImage item={item} className="fiche-image" />

        <div className="fiche-infos">
          <p className="carte-region">
            <Drapeau region={item.categorie} taille={18} /> Cuisine {item.categorie.toLowerCase()}
          </p>
          <h1>{item.titre}</h1>
          <ul className="caracteristiques">
            <li>⏱ {formatDuree(item.temps_preparation)} au total</li>
            <li>📊 {LIBELLES_DIFFICULTE[item.difficulte]}</li>
            <li>📅 Ajoutée en {item.annee}</li>
          </ul>
          <p>{item.description}</p>
          <div className="actions">
            <BoutonLike itemId={item.id} />
            <BoutonFavori item={item} avecTexte />
          </div>
        </div>
      </div>

      <FicheRecette itemId={item.id} />

      <SectionCollection item={item} />
    </div>
  );
}
