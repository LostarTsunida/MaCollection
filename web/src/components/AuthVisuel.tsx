// Partie colorée à gauche des pages de connexion et d'inscription
const DECO = ["🍕", "🍣", "🌮", "🥐", "🍜", "🥘"];

export default function AuthVisuel({ inscription }: { inscription: boolean }) {
  return (
    <aside className="auth-visuel">
      <div className="hero-deco" aria-hidden="true">
        {DECO.map((emoji) => (
          <span key={emoji}>{emoji}</span>
        ))}
      </div>

      <img src="/logo.svg" alt="" className="auth-logo" />
      <p className="auth-marque">
        Les Recettes de <span>Mattéquila &amp; Lorisotto</span>
      </p>
      <h2 className="auth-accroche">{inscription ? "Rejoins la brigade\u00a0!" : "Bon retour en cuisine\u00a0!"}</h2>
      <p className="auth-texte">
        {inscription
          ? "Crée ton compte pour garder tes recettes, les noter et liker tes plats préférés."
          : "Connecte-toi pour retrouver ta collection, tes favoris et tes statistiques."}
      </p>

      <div className="auth-chefs" aria-hidden="true">
        <img src="/images/chefs/defaut-1.webp" alt="" />
        <img src="/images/chefs/defaut-2.webp" alt="" />
      </div>
    </aside>
  );
}
