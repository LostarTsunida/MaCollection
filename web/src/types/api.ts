// Types du contrat d'API, écrits à la main

export type Statut = "a_decouvrir" | "en_cours" | "termine";
export type Difficulte = "facile" | "moyen" | "difficile";
export type Tri = "date" | "note";

export interface Item {
  id: number;
  titre: string;
  categorie: string;
  description: string;
  image_url: string;
  annee: number;
  temps_preparation: number;
  difficulte: Difficulte;
}

export interface PageItems {
  total: number;
  page: number;
  limit: number;
  results: Item[];
}

export interface Entry {
  id: number;
  statut: Statut;
  note: number | null;
  commentaire: string | null;
  date_ajout: string;
  item: Item;
}

export interface EntryCreate {
  item_id: number;
  statut: Statut;
  note?: number | null;
  commentaire?: string | null;
}

export interface EntryUpdate {
  statut?: Statut;
  note?: number | null;
  commentaire?: string | null;
}

export interface Stats {
  total: number;
  par_statut: Record<Statut, number>;
  note_moyenne: number; // 0 si aucune recette notée
}

export interface Utilisateur {
  id: number;
  email: string;
}

export interface Identifiants {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LikesInfo {
  item_id: number;
  total: number;
}

export interface ItemPopulaire {
  item: Item;
  likes: number;
}

// Format d'erreur renvoyé par le handler de l'API
export interface ErreurApi {
  erreur: {
    code: number;
    message: string;
  };
}

export interface Ingredient {
  quantite: string;
  nom: string;
}

// Fiche complète d'une recette (route /items/{id}/fiche)
export interface Fiche {
  item_id: number;
  titre: string;
  description: string;
  portions: number;
  temps_preparation: number;
  temps_cuisson: number;
  temps_repos: number;
  temps_total: number;
  difficulte: Difficulte;
  ingredients: Ingredient[];
  ustensiles: string[];
  etapes: string[];
  astuces: string[];
  variantes: string[];
  conservation: string;
}
