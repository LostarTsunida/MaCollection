import { useState } from "react";
import FiltresRegion from "../components/FiltresRegion";
import HeroRecherche from "../components/HeroRecherche";
import { Chargement, EtatVide, MessageErreur } from "../components/Etats";
import ItemCard from "../components/ItemCard";
import Pagination from "../components/Pagination";
import Populaires from "../components/Populaires";
import RegionBanniere from "../components/RegionBanniere";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

const PAR_PAGE = 12;

export default function CataloguePage() {
  const [recherche, setRecherche] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const rechercheRetardee = useDebounce(recherche, 400);

  const categories = useFetch(() => api.categories(), []);
  const { donnees, chargement, erreur, recharger } = useFetch(
    () => api.items({ q: rechercheRetardee, categorie: region, page, limit: PAR_PAGE }),
    [rechercheRetardee, region, page],
  );

  function changerRecherche(valeur: string) {
    setRecherche(valeur);
    setPage(1);
  }

  function changerRegion(valeur: string) {
    setRegion(valeur);
    setPage(1);
  }

  function changerPage(nouvellePage: number) {
    setPage(nouvellePage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const totalPages = donnees ? Math.ceil(donnees.total / donnees.limit) : 0;
  const accueil = recherche === "" && region === "" && page === 1;

  return (
    <div>
      <HeroRecherche recherche={recherche} region={region} onRecherche={changerRecherche} />

      {categories.erreur ? (
        <MessageErreur message={categories.erreur} onReessayer={categories.recharger} />
      ) : (
        <FiltresRegion regions={categories.donnees ?? []} active={region} onChange={changerRegion} />
      )}

      {region !== "" && <RegionBanniere region={region} />}

      {accueil && <Populaires />}

      <section>
        {donnees && !chargement && (
          <p className="texte-discret">
            {donnees.total} recette{donnees.total > 1 ? "s" : ""} trouvée{donnees.total > 1 ? "s" : ""}
          </p>
        )}

        {chargement && <Chargement />}
        {!chargement && erreur && <MessageErreur message={erreur} onReessayer={recharger} />}
        {!chargement && !erreur && donnees && donnees.results.length === 0 && (
          <EtatVide message="Aucune recette ne correspond à ta recherche.">
            <button className="bouton bouton-secondaire" onClick={() => { changerRecherche(""); changerRegion(""); }}>
              Effacer les filtres
            </button>
          </EtatVide>
        )}
        {!chargement && !erreur && donnees && donnees.results.length > 0 && (
          <>
            <div className="grille">
              {donnees.results.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={changerPage} />
          </>
        )}
      </section>
    </div>
  );
}
