import { Link } from "react-router-dom";
import { Chargement, EtatVide, MessageErreur } from "../components/Etats";
import ItemCard from "../components/ItemCard";
import { useCollection } from "../context/CollectionContext";

export default function FavorisPage() {
  const { favoris, chargement, erreur, recharger } = useCollection();

  return (
    <div>
      <h1>Mes favoris</h1>

      {chargement && <Chargement />}
      {!chargement && erreur && <MessageErreur message={erreur} onReessayer={recharger} />}
      {!chargement && !erreur && favoris.length === 0 && (
        <EtatVide message="Tu n'as pas encore de favoris. Clique sur ♡ sur une recette pour l'ajouter.">
          <Link className="bouton" to="/">
            Parcourir les recettes
          </Link>
        </EtatVide>
      )}
      {!chargement && !erreur && favoris.length > 0 && (
        <div className="grille">
          {favoris.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
