import type { ReactNode } from "react";

export function Chargement({ texte = "Chargement..." }: { texte?: string }) {
  return (
    <div className="etat" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texte}</p>
    </div>
  );
}

interface MessageErreurProps {
  message: string;
  onReessayer?: () => void;
}

export function MessageErreur({ message, onReessayer }: MessageErreurProps) {
  return (
    <div className="etat etat-erreur" role="alert">
      <p>{message}</p>
      {onReessayer && (
        <button className="bouton bouton-secondaire" onClick={onReessayer}>
          Réessayer
        </button>
      )}
    </div>
  );
}

interface EtatVideProps {
  message: string;
  children?: ReactNode;
}

export function EtatVide({ message, children }: EtatVideProps) {
  return (
    <div className="etat etat-vide">
      <p>{message}</p>
      {children}
    </div>
  );
}
