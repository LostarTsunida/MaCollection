import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { tokenValide } from "../utils/jwt";

export default function RegisterPage() {
  const { token, inscription } = useAuth();
  const navigate = useNavigate();

  if (tokenValide(token)) return <Navigate to="/" replace />;

  async function valider(email: string, password: string) {
    await inscription(email, password);
    navigate("/", { replace: true });
  }

  return (
    <AuthForm titre="Créer un compte" libelleBouton="S'inscrire" avecConfirmation onValider={valider}>
      <p className="texte-discret">
        Déjà inscrit ? <Link to="/login">Se connecter</Link>
      </p>
    </AuthForm>
  );
}
