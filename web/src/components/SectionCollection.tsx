import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../context/CollectionContext";
import type { Item } from "../types/api";
import EntryForm from "./EntryForm";
import type { ValeursEntree } from "./EntryForm";
import Etoiles from "./Etoiles";
import StatutBadge from "./StatutBadge";

// Bloc "Ma collection" affiché sur la fiche d'une recette
export default function SectionCollection({ item }: { item: Item }) {
  const { token } = useAuth();
  const { entreePour, ajouterEntree, modifierEntree } = useCollection();
  const [edition, setEdition] = useState(false);
  const entree = entreePour(item.id);

  if (!token) {
    return (
      <section className="bloc">
        <h2>Ma collection</h2>
        <p>
          <Link to="/login">Connecte-toi</Link> pour ajouter cette recette à ta collection.
        </p>
      </section>
    );
  }

  async function ajouter(valeurs: ValeursEntree) {
    await ajouterEntree({
      item_id: item.id,
      statut: valeurs.statut,
      note: valeurs.note,
      commentaire: valeurs.commentaire || null,
    });
  }

  async function modifier(valeurs: ValeursEntree) {
    if (!entree) return;
    await modifierEntree(entree.id, {
      statut: valeurs.statut,
      note: valeurs.note,
      commentaire: valeurs.commentaire || null,
    });
    setEdition(false);
  }

  if (!entree) {
    return (
      <section className="bloc">
        <h2>Ajouter à ma collection</h2>
        <EntryForm libelleBouton="Ajouter" onValider={ajouter} />
      </section>
    );
  }

  return (
    <section className="bloc">
      <h2>Dans ma collection</h2>
      {edition ? (
        <EntryForm
          initial={{ statut: entree.statut, note: entree.note, commentaire: entree.commentaire ?? "" }}
          libelleBouton="Enregistrer"
          onValider={modifier}
          onAnnuler={() => setEdition(false)}
        />
      ) : (
        <>
          <p>
            <StatutBadge statut={entree.statut} /> <Etoiles note={entree.note} />
          </p>
          {entree.commentaire && <p className="commentaire">« {entree.commentaire} »</p>}
          <div className="actions">
            <button className="bouton bouton-secondaire" onClick={() => setEdition(true)}>
              Modifier
            </button>
            <Link className="bouton bouton-secondaire" to="/collection">
              Voir ma collection
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
