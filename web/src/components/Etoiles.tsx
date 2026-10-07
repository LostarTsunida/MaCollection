interface EtoilesProps {
  note: number | null;
  onChange?: (note: number | null) => void;
}

const VALEURS = [1, 2, 3, 4, 5];

// Affiche une note sur 5. Si onChange est fourni, les étoiles sont cliquables.
export default function Etoiles({ note, onChange }: EtoilesProps) {
  if (!onChange) {
    if (note === null) return <span className="etoiles etoiles-vide">Pas encore notée</span>;
    const valeur = note;
    return (
      <span className="etoiles" aria-label={`Note : ${valeur} sur 5`}>
        {VALEURS.map((v) => (v <= valeur ? "★" : "☆")).join("")}
      </span>
    );
  }

  return (
    <div className="etoiles etoiles-cliquables" role="group" aria-label="Choisir une note">
      {VALEURS.map((v) => (
        <button
          key={v}
          type="button"
          className={note !== null && v <= note ? "active" : ""}
          onClick={() => onChange(note === v ? null : v)}
          aria-label={`${v} sur 5`}
        >
          {note !== null && v <= note ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
