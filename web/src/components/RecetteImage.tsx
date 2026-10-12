import { useState } from "react";
import type { Item } from "../types/api";
import Drapeau from "./Drapeau";

interface RecetteImageProps {
  item: Item;
  className?: string;
}

// Si l'image ne charge pas, on affiche un visuel de secours avec le drapeau
export default function RecetteImage({ item, className = "" }: RecetteImageProps) {
  const [enErreur, setEnErreur] = useState(false);

  if (enErreur || !item.image_url) {
    return (
      <div className={`image-secours ${className}`} aria-label={item.titre}>
        <Drapeau region={item.categorie} taille={60} />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={item.image_url}
      alt={item.titre}
      loading="lazy"
      onError={() => setEnErreur(true)}
    />
  );
}
