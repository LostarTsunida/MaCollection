import { useState } from "react";
import type { FormEvent } from "react";
import type { Statut } from "../types/api";
import { messageErreur } from "../services/client";
import { LIBELLES_STATUT, STATUTS } from "../utils/format";
import Etoiles from "./Etoiles";

export interface ValeursEntree {
  statut: Statut;
  note: number | null;
  commentaire: string;
}

interface EntryFormProps {
  initial?: ValeursEntree;
  libelleBouton: string;
  onValider: (valeurs: ValeursEntree) => Promise<void>;
  onAnnuler?: () => void;
}

const VIDE: ValeursEntree = { statut: "a_decouvrir", note: null, commentaire: "" };

export default function EntryForm({ initial = VIDE, libelleBouton, onValider, onAnnuler }: EntryFormProps) {
  const [statut, setStatut] = useState<Statut>(initial.statut);
  const [note, setNote] = useState<number | null>(initial.note);
  const [commentaire, setCommentaire] = useState(initial.commentaire);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // on vérifie que la valeur fait bien partie des statuts plutôt que de faire un cast
  function choisirStatut(valeur: string) {
    const trouve = STATUTS.find((s) => s === valeur);
    if (trouve) setStatut(trouve);
  }

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await onValider({ statut, note, commentaire: commentaire.trim() });
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className="formulaire" onSubmit={soumettre}>
      <label>
        Statut
        <select value={statut} onChange={(e) => choisirStatut(e.target.value)}>
          {STATUTS.map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT[s]}
            </option>
          ))}
        </select>
      </label>

      <div className="champ">
        <span>Note {note === null && <small>(optionnelle)</small>}</span>
        <Etoiles note={note} onChange={setNote} />
      </div>

      <label>
        Commentaire
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ex : un peu moins de sel la prochaine fois"
        />
      </label>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <div className="actions">
        <button className="bouton" type="submit" disabled={envoi}>
          {envoi ? "Enregistrement..." : libelleBouton}
        </button>
        {onAnnuler && (
          <button className="bouton bouton-secondaire" type="button" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
