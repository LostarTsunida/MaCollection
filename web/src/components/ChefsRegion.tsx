import { themeRegion } from "../utils/regions";

interface ChefsRegionProps {
  region: string;
  numero: 1 | 2;
}

// Un des deux chefs du site, habillé selon la région choisie (tenue par défaut sinon).
// Image détourée (fond transparent) pour qu'elle se fonde dans la page.
export default function ChefsRegion({ region, numero }: ChefsRegionProps) {
  const slug = themeRegion(region)?.slug ?? "defaut";
  return (
    <img
      className={`hero-chef hero-chef-${numero}`}
      src={`/images/chefs/${slug}-${numero}.webp`}
      alt=""
      aria-hidden="true"
    />
  );
}
