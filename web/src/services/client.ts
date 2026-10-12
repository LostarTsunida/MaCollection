import type { ErreurApi } from "../types/api";

// Seul fichier du projet qui utilise fetch
const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const CLE_TOKEN = "token";
export const EVENEMENT_SESSION_EXPIREE = "session-expiree";

export class ApiError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

type Methode = "GET" | "POST" | "PATCH" | "DELETE";

function estErreurApi(corps: unknown): corps is ErreurApi {
  if (typeof corps !== "object" || corps === null || !("erreur" in corps)) {
    return false;
  }
  const erreur = corps.erreur;
  return typeof erreur === "object" && erreur !== null && "code" in erreur && "message" in erreur;
}

function lireToken(): string | null {
  try {
    const brut = localStorage.getItem(CLE_TOKEN);
    if (brut === null) return null;
    const valeur: unknown = JSON.parse(brut);
    return typeof valeur === "string" ? valeur : null;
  } catch {
    return null;
  }
}

async function envoyer(methode: Methode, chemin: string, corps?: unknown): Promise<Response> {
  const headers: Record<string, string> = {};
  const token = lireToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (corps !== undefined) headers["Content-Type"] = "application/json";

  let reponse: Response;
  try {
    reponse = await fetch(API_URL + chemin, {
      method: methode,
      headers,
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
  } catch {
    throw new ApiError(0, "Impossible de contacter le serveur. L'API est-elle lancée ?");
  }

  if (!reponse.ok) {
    let message = `Erreur ${reponse.status}`;
    try {
      const donnees: unknown = await reponse.json();
      if (estErreurApi(donnees)) message = donnees.erreur.message;
    } catch {
      // pas de JSON dans la réponse, on garde le message par défaut
    }
    // token expiré pendant la navigation : on prévient l'AuthContext
    if (reponse.status === 401 && token) {
      window.dispatchEvent(new Event(EVENEMENT_SESSION_EXPIREE));
    }
    throw new ApiError(reponse.status, message);
  }
  return reponse;
}

export async function requete<T>(methode: Methode, chemin: string, corps?: unknown): Promise<T> {
  const reponse = await envoyer(methode, chemin, corps);
  const donnees: unknown = await reponse.json();
  return donnees as T;
}

// pour les routes qui répondent 204 sans contenu
export async function requeteSansReponse(methode: Methode, chemin: string): Promise<void> {
  await envoyer(methode, chemin);
}

export function messageErreur(erreur: unknown): string {
  if (erreur instanceof Error) return erreur.message;
  return "Une erreur inattendue est survenue";
}
