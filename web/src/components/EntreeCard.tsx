import { useState } from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../context/CollectionContext";
import { messageErreur } from "../services/client";
import type { Entry } from "../types/api";
import { formatDate } from "../utils/format";
import { classeTheme } from "../utils/regions";
import Drapeau from "./Drapeau";
import EntryForm from "./EntryForm";
import type { ValeursEntree } from "./EntryForm";
import Etoiles from "./Etoiles";
import RecetteImage from "./RecetteImage";
import StatutBadge from "./StatutBadge";

export default function EntreeCard({ entree }: { entree: Entry }) {
  const { modifierEntree, supprimerEntree } = useCollection();
  const [edition, setEdition] = useState(false);
  const [suppression, setSuppression] = useState(false);

  async function enregistrer(valeurs: ValeursEntree) {
    await modifierEntree(entree.id, {
      statut: valeurs.statut,
      note: valeurs.note,
      commentaire: valeurs.commentaire || null,
    });
    setEdition(false);
  }

  async function supprimer() {
    if (!window.confirm(`Retirer « ${entree.item.titre} » de ta collection ?`)) return;
    setSuppression(true);
    try {
      await supprimerEntree(entree.id);
    } catch (e) {
      alert(messageErreur(e));
      setSuppression(false);
    }
  }

  return (
    <article className={`entree ${classeTheme(entree.item.categorie)}`}>
      <Link to={`/recettes/${entree.item.id}`}>
        <RecetteImage item={entree.item} className="entree-image" />
      </Link>

      <div className="entree-contenu">
        <div className="entree-entete">
          <div>
            <Link to={`/recettes/${entree.item.id}`} className="entree-titre">
              {entree.item.titre}
            </Link>
            <p className="texte-discret">
              <Drapeau region={entree.item.categorie} taille={16} /> {entree.item.categorie} · ajoutée le {formatDate(entree.date_ajout)}
            </p>
          </div>
          <StatutBadge statut={entree.statut} />
        </div>

        {edition ? (
          <EntryForm
            initial={{ statut: entree.statut, note: entree.note, commentaire: entree.commentaire ?? "" }}
            libelleBouton="Enregistrer"
            onValider={enregistrer}
            onAnnuler={() => setEdition(false)}
          />
        ) : (
          <>
            <Etoiles note={entree.note} />
            {entree.commentaire && <p className="commentaire">« {entree.commentaire} »</p>}
            <div className="actions">
              <button className="bouton bouton-secondaire" onClick={() => setEdition(true)}>
                Modifier
              </button>
              <button className="bouton bouton-danger" onClick={supprimer} disabled={suppression}>
                {suppression ? "Suppression..." : "Retirer"}
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
