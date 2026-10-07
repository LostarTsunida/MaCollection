import { Link } from "react-router-dom";
import { EtatVide } from "../components/Etats";

export default function NotFoundPage() {
  return (
    <EtatVide message="Oups, cette page n'existe pas.">
      <Link className="bouton" to="/">
        Retour aux recettes
      </Link>
    </EtatVide>
  );
}
