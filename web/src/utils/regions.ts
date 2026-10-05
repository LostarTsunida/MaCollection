// Thème visuel de chaque région : les couleurs et polices sont dans themes.css
export interface ThemeRegion {
  slug: string;
  lieux: string;
  ambiance: string;
}

const THEMES: Record<string, ThemeRegion> = {
  Italienne: { slug: "italienne", lieux: "Rome · Venise · Florence", ambiance: "Trattoria ensoleillée" },
  Française: { slug: "francaise", lieux: "Paris · Provence · Mont-Saint-Michel", ambiance: "Bistrot parisien" },
  Espagnole: { slug: "espagnole", lieux: "Séville · Barcelone · Grenade", ambiance: "Tapas en terrasse" },
  Chinoise: { slug: "chinoise", lieux: "Pékin · Grande Muraille · Guilin", ambiance: "Laque et encre" },
  Japonaise: { slug: "japonaise", lieux: "Mont Fuji · Kyoto · Fushimi Inari", ambiance: "Épuré et zen" },
  Indienne: { slug: "indienne", lieux: "Agra · Jaipur · Kerala", ambiance: "Marché aux épices" },
  Mexicaine: { slug: "mexicaine", lieux: "Chichén Itzá · Mexico · Oaxaca", ambiance: "Marché coloré" },
  Marocaine: { slug: "marocaine", lieux: "Marrakech · Chefchaouen · Merzouga", ambiance: "Riad et thé à la menthe" },
  Américaine: { slug: "americaine", lieux: "New York · San Francisco · Monument Valley", ambiance: "Diner et road trip" },
};

export function themeRegion(region: string): ThemeRegion | undefined {
  return THEMES[region];
}

// classe CSS à mettre sur un élément pour lui appliquer les couleurs de la région
export function classeTheme(region: string): string {
  const theme = THEMES[region];
  return theme ? `theme-${theme.slug}` : "";
}
