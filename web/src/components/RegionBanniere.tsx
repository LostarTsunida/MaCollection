import { themeRegion } from "../utils/regions";

interface RegionBanniereProps {
  region: string;
  titre?: string;
}

// Bandeau illustré avec les lieux emblématiques de la région
export default function RegionBanniere({ region, titre }: RegionBanniereProps) {
  const theme = themeRegion(region);
  if (!theme) return null;

  return (
    <div className={`banniere theme-${theme.slug}`}>
      <img src={`/images/regions/${theme.slug}-banniere.svg`} alt={`Paysage : ${theme.lieux}`} />
      <div className="banniere-texte">
        <h2>{titre ?? `Cuisine ${region.toLowerCase()}`}</h2>
        <p>
          {theme.lieux} · {theme.ambiance}
        </p>
      </div>
    </div>
  );
}
