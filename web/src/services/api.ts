import type {
  Entry,
  EntryCreate,
  EntryUpdate,
  Fiche,
  Identifiants,
  Item,
  ItemPopulaire,
  LikesInfo,
  PageItems,
  Stats,
  Statut,
  TokenResponse,
  Tri,
  Utilisateur,
} from "../types/api";
import { requete, requeteSansReponse } from "./client";

export interface RechercheItems {
  q: string;
  categorie: string;
  page: number;
  limit: number;
}

function versQueryString(recherche: RechercheItems): string {
  const params = new URLSearchParams();
  // l'API refuse un mot-clé de moins de 2 caractères
  if (recherche.q.trim().length >= 2) params.set("q", recherche.q.trim());
  if (recherche.categorie) params.set("categorie", recherche.categorie);
  params.set("page", String(recherche.page));
  params.set("limit", String(recherche.limit));
  return params.toString();
}

export const api = {
  // Authentification
  inscription: (identifiants: Identifiants) => requete<Utilisateur>("POST", "/auth/register", identifiants),
  connexion: (identifiants: Identifiants) => requete<TokenResponse>("POST", "/auth/login", identifiants),
  moi: () => requete<Utilisateur>("GET", "/auth/me"),

  // Catalogue
  items: (recherche: RechercheItems) => requete<PageItems>("GET", `/items?${versQueryString(recherche)}`),
  item: (id: number) => requete<Item>("GET", `/items/${id}`),
  fiche: (id: number) => requete<Fiche>("GET", `/items/${id}/fiche`),
  categories: () => requete<string[]>("GET", "/items/categories"),
  populaires: () => requete<ItemPopulaire[]>("GET", "/items/populaires?limit=4"),
  likesItem: (id: number) => requete<LikesInfo>("GET", `/items/${id}/likes`),

  // Collection
  collection: (statut?: Statut, tri: Tri = "date") => {
    const params = new URLSearchParams({ tri });
    if (statut) params.set("statut", statut);
    return requete<Entry[]>("GET", `/me/collection?${params.toString()}`);
  },
  ajouterEntree: (entree: EntryCreate) => requete<Entry>("POST", "/me/collection", entree),
  modifierEntree: (id: number, modif: EntryUpdate) => requete<Entry>("PATCH", `/me/collection/${id}`, modif),
  supprimerEntree: (id: number) => requeteSansReponse("DELETE", `/me/collection/${id}`),
  stats: () => requete<Stats>("GET", "/me/stats"),

  // Favoris et likes
  favoris: () => requete<Item[]>("GET", "/me/favoris"),
  ajouterFavori: (itemId: number) => requete<Item>("POST", `/me/favoris/${itemId}`),
  retirerFavori: (itemId: number) => requeteSansReponse("DELETE", `/me/favoris/${itemId}`),
  mesLikes: () => requete<number[]>("GET", "/me/likes"),
  liker: (itemId: number) => requete<LikesInfo>("POST", `/me/likes/${itemId}`),
  retirerLike: (itemId: number) => requeteSansReponse("DELETE", `/me/likes/${itemId}`),
};
