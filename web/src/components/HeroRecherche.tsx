import { classeTheme, themeRegion } from "../utils/regions";
import ChefsRegion from "./ChefsRegion";

// petits plats qui flottent en fond, juste pour la déco
const DECO = ["🍕", "🍣", "🌮", "🥐", "🍜", "🥘", "🍛", "🫖"];

interface HeroRechercheProps {
  recherche: string;
  region: string;
  onRecherche: (valeur: string) => void;
}

export default function HeroRecherche({ recherche, region, onRecherche }: HeroRechercheProps) {
  const theme = themeRegion(region);

  return (
    <section className={`hero ${classeTheme(region)}`}>
      <div className="hero-deco" aria-hidden="true">
        {DECO.map((emoji) => (
          <span key={emoji}>{emoji}</span>
        ))}
      </div>

      <ChefsRegion region={region} numero={1} />

      <div className="hero-contenu">
        <p className="hero-sur-titre">
          {theme ? `Escale ${region.toLowerCase()} · ${theme.lieux}` : "Cuisine du monde · 9 pays · 2 chefs"}
        </p>
        <h1>
          Le tour du monde <span>dans ton assiette</span>
        </h1>
        <p className="hero-texte">Trouve une recette, garde-la dans ta collection et note-la une fois testée.</p>

        <label className="recherche-boite">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            className="recherche"
            placeholder="Poulet, riz, chocolat..."
            value={recherche}
            onChange={(e) => onRecherche(e.target.value)}
            aria-label="Rechercher une recette"
          />
          {recherche !== "" && (
            <button type="button" className="recherche-effacer" onClick={() => onRecherche("")} aria-label="Effacer la recherche">
              ×
            </button>
          )}
        </label>
        {recherche.trim().length === 1 && <p className="hero-aide">Tape au moins 2 lettres.</p>}
      </div>

      <ChefsRegion region={region} numero={2} />
    </section>
  );
}
