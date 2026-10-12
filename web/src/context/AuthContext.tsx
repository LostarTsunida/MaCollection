import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api } from "../services/api";
import { ApiError, CLE_TOKEN, EVENEMENT_SESSION_EXPIREE } from "../services/client";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { tokenValide } from "../utils/jwt";
import type { Utilisateur } from "../types/api";

interface AuthContextValeur {
  token: string | null;
  utilisateur: Utilisateur | null;
  chargement: boolean;
  connexion: (email: string, password: string) => Promise<void>;
  inscription: (email: string, password: string) => Promise<void>;
  deconnexion: () => void;
}

const AuthContext = createContext<AuthContextValeur | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useLocalStorage<string | null>(CLE_TOKEN, null);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);

  const deconnexion = useCallback(() => {
    setToken(null);
    setUtilisateur(null);
  }, [setToken]);

  // à chaque changement de token on récupère l'utilisateur courant
  useEffect(() => {
    if (!token) {
      setChargement(false);
      return;
    }
    if (!tokenValide(token)) {
      deconnexion();
      return;
    }
    let annule = false;
    setChargement(true);
    api
      .moi()
      .then((u) => {
        if (!annule) setUtilisateur(u);
      })
      .catch((e: unknown) => {
        // on ne déconnecte que si l'API refuse le token (pas si le serveur est juste éteint)
        if (!annule && e instanceof ApiError && e.code === 401) deconnexion();
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [token, deconnexion]);

  // le client HTTP déclenche cet évènement quand l'API répond 401
  useEffect(() => {
    window.addEventListener(EVENEMENT_SESSION_EXPIREE, deconnexion);
    return () => window.removeEventListener(EVENEMENT_SESSION_EXPIREE, deconnexion);
  }, [deconnexion]);

  const connexion = useCallback(
    async (email: string, password: string) => {
      const reponse = await api.connexion({ email, password });
      setToken(reponse.access_token);
    },
    [setToken],
  );

  const inscription = useCallback(
    async (email: string, password: string) => {
      await api.inscription({ email, password });
      await connexion(email, password);
    },
    [connexion],
  );

  const valeur: AuthContextValeur = { token, utilisateur, chargement, connexion, inscription, deconnexion };
  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValeur {
  const contexte = useContext(AuthContext);
  if (contexte === null) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return contexte;
}
