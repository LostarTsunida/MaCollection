import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import type { Fiche } from "../types/api";
import { LIBELLES_DIFFICULTE, formatDuree } from "../utils/format";
import { Chargement, MessageErreur } from "./Etats";

function Temps({ fiche }: { fiche: Fiche }) {
  const cases = [
    { libelle: "Préparation", valeur: fiche.temps_preparation },
    { libelle: "Cuisson", valeur: fiche.temps_cuisson },
    { libelle: "Repos", valeur: fiche.temps_repos },
    { libelle: "Total", valeur: fiche.temps_total },
  ];
  return (
    <div className="temps">
      {cases.map((c) => (
        <div key={c.libelle}>
          <strong>{c.valeur === 0 ? "–" : formatDuree(c.valeur)}</strong>
          <span>{c.libelle}</span>
        </div>
      ))}
    </div>
  );
}

function Conseils({ fiche }: { fiche: Fiche }) {
  return (
    <section className="bloc conseils">
      <h2>Le coin du chef</h2>
      <h3>Astuces</h3>
      <ul>
        {fiche.astuces.map((astuce) => (
          <li key={astuce}>{astuce}</li>
        ))}
      </ul>
      <h3>Variantes</h3>
      <ul>
        {fiche.variantes.map((variante) => (
          <li key={variante}>{variante}</li>
        ))}
      </ul>
      <h3>Conservation</h3>
      <p>{fiche.conservation}</p>
    </section>
  );
}

// Fiche complète : temps, ingrédients, ustensiles, étapes, conseils
export default function FicheRecette({ itemId }: { itemId: number }) {
  const { donnees: fiche, chargement, erreur, recharger } = useFetch(() => api.fiche(itemId), [itemId]);

  if (chargement) return <Chargement texte="Chargement de la fiche..." />;
  if (erreur) return <MessageErreur message={erreur} onReessayer={recharger} />;
  if (!fiche) return null;

  return (
    <>
      <Temps fiche={fiche} />
      <p className="texte-discret">
        Pour {fiche.portions} personne{fiche.portions > 1 ? "s" : ""} · Difficulté : {LIBELLES_DIFFICULTE[fiche.difficulte]}
      </p>

      <div className="fiche-colonnes">
        <div>
          <section className="bloc">
            <h2>Ingrédients</h2>
            <ul className="liste-ingredients">
              {fiche.ingredients.map((ingredient) => (
                <li key={`${ingredient.quantite}-${ingredient.nom}`}>
                  <span className="quantite">{ingredient.quantite}</span>
                  <span>{ingredient.nom}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="bloc">
            <h2>Ustensiles</h2>
            <ul className="puces-ustensiles">
              {fiche.ustensiles.map((ustensile) => (
                <li key={ustensile}>{ustensile}</li>
              ))}
            </ul>
          </section>
        </div>

        <div>
          <section className="bloc">
            <h2>Préparation</h2>
            <ol className="etapes">
              {fiche.etapes.map((etape) => (
                <li key={etape}>{etape}</li>
              ))}
            </ol>
          </section>
          <Conseils fiche={fiche} />
        </div>
      </div>
    </>
  );
}
