// Vérifie côté client que le token n'est pas expiré (la vraie vérification reste faite par l'API)
export function tokenValide(token: string | null): boolean {
  if (!token) return false;
  const morceaux = token.split(".");
  if (morceaux.length !== 3) return false;

  try {
    const base64 = morceaux[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload: unknown = JSON.parse(atob(base64));
    if (typeof payload !== "object" || payload === null || !("exp" in payload)) return false;
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
