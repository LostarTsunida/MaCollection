import Drapeau from "./Drapeau";
import { classeTheme } from "../utils/regions";

interface FiltresRegionProps {
  regions: string[];
  active: string;
  onChange: (region: string) => void;
}

export default function FiltresRegion({ regions, active, onChange }: FiltresRegionProps) {
  return (
    <div className="puces" role="group" aria-label="Filtrer par région">
      <button className={active === "" ? "puce active" : "puce"} onClick={() => onChange("")}>
        🌍 Toutes
      </button>
      {regions.map((region) => (
        <button
          key={region}
          className={`puce ${classeTheme(region)}${active === region ? " active" : ""}`}
          onClick={() => onChange(region)}
        >
          <Drapeau region={region} /> {region}
        </button>
      ))}
    </div>
  );
}
