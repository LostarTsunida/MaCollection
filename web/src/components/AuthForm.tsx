import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { messageErreur } from "../services/client";
import AuthVisuel from "./AuthVisuel";

interface AuthFormProps {
  titre: string;
  libelleBouton: string;
  avecConfirmation?: boolean;
  onValider: (email: string, password: string) => Promise<void>;
  children?: ReactNode;
}

export default function AuthForm({ titre, libelleBouton, avecConfirmation = false, onValider, children }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [visible, setVisible] = useState(false);

  async function soumettre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (avecConfirmation && password !== confirmation) {
      setErreur("Les deux mots de passe ne sont pas identiques");
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      await onValider(email, password);
    } catch (err) {
      setErreur(messageErreur(err));
      setEnvoi(false);
    }
  }

  return (
    <div className="page-auth">
      <div className="auth-carte">
        <AuthVisuel inscription={avecConfirmation} />

        <form className="auth-form" onSubmit={soumettre}>
          <h1>{titre}</h1>

          <label className="auth-champ">
            <span>Email</span>
            <div className="auth-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M4 7l8 6 8-6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="chef@exemple.fr"
              />
            </div>
          </label>

          <label className="auth-champ">
            <span>Mot de passe</span>
            <div className="auth-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={avecConfirmation ? 6 : undefined}
                autoComplete={avecConfirmation ? "new-password" : "current-password"}
                placeholder="••••••••"
              />
              <button type="button" className="auth-voir" onClick={() => setVisible(!visible)}>
                {visible ? "Cacher" : "Voir"}
              </button>
            </div>
          </label>

          {avecConfirmation && (
            <label className="auth-champ">
              <span>Confirmer le mot de passe</span>
              <div className="auth-input">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12l4 4 10-10" />
                </svg>
                <input
                  type={visible ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </div>
            </label>
          )}

          {erreur && <p className="message-erreur">{erreur}</p>}

          <button className="auth-bouton" type="submit" disabled={envoi}>
            {envoi ? "Patiente..." : libelleBouton}
          </button>
          {children}
        </form>
      </div>
    </div>
  );
}
