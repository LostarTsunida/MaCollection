import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { tokenValide } from "../utils/jwt";

// state passé par ProtectedRoute : on vérifie sa forme car il est de type unknown
function pageDemandee(state: unknown): string {
  if (typeof state === "object" && state !== null && "depuis" in state && typeof state.depuis === "string") {
    return state.depuis;
  }
  return "/collection";
}

export default function LoginPage() {
  const { token, connexion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = pageDemandee(location.state);

  if (tokenValide(token)) return <Navigate to={destination} replace />;

  async function valider(email: string, password: string) {
    await connexion(email, password);
    navigate(destination, { replace: true });
  }

  return (
    <AuthForm titre="Connexion" libelleBouton="Se connecter" onValider={valider}>
      <p className="texte-discret">
        Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
      </p>
    </AuthForm>
  );
}
