import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";

export default function Header() {
  const { token, utilisateur, deconnexion } = useAuth();
  const [theme, basculerTheme] = useTheme();
  const navigate = useNavigate();

  function seDeconnecter() {
    deconnexion();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-contenu">
        <NavLink to="/" className="logo">
          <img src="/logo.svg" alt="" className="logo-image" />
          <span className="logo-texte">
            <small>Les Recettes de</small>
            <strong>Mattéquila &amp; Lorisotto</strong>
          </span>
        </NavLink>

        <nav className="nav">
          <NavLink to="/" end>
            Recettes
          </NavLink>
          {token && (
            <>
              <NavLink to="/collection">Ma collection</NavLink>
              <NavLink to="/favoris">Favoris</NavLink>
              <NavLink to="/stats">Stats</NavLink>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="bouton-icone"
            onClick={basculerTheme}
            title={theme === "clair" ? "Passer en mode sombre" : "Passer en mode clair"}
          >
            {theme === "clair" ? "🌙" : "☀️"}
          </button>
          {token ? (
            <>
              <span className="utilisateur" title={utilisateur?.email}>
                {utilisateur?.email}
              </span>
              <button className="bouton bouton-secondaire" onClick={seDeconnecter}>
                Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/login" className="bouton">
              Connexion
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
