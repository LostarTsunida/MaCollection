// Petits drapeaux en SVG : les emojis drapeaux ne s'affichent pas sous Windows (on voyait "FR", "IT"...)

function etoile(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rayon = i % 2 === 0 ? r : r * 0.4;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(`${(cx + rayon * Math.cos(angle)).toFixed(2)},${(cy + rayon * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

function bandesVerticales([gauche, milieu, droite]: [string, string, string]) {
  return (
    <>
      <rect x={0} y={0} width={10} height={20} fill={gauche} />
      <rect x={10} y={0} width={10} height={20} fill={milieu} />
      <rect x={20} y={0} width={10} height={20} fill={droite} />
    </>
  );
}

function bandesHorizontales([haut, milieu, bas]: [string, string, string], hauteurMilieu = 20 / 3) {
  const hauteurBord = (20 - hauteurMilieu) / 2;
  return (
    <>
      <rect x={0} y={0} width={30} height={hauteurBord} fill={haut} />
      <rect x={0} y={hauteurBord} width={30} height={hauteurMilieu} fill={milieu} />
      <rect x={0} y={hauteurBord + hauteurMilieu} width={30} height={hauteurBord} fill={bas} />
    </>
  );
}

// 7 bandes rouges du drapeau américain, dessinées en un seul chemin
const BANDES_USA = [0, 2, 4, 6, 8, 10, 12]
  .map((n) => `M0 ${((n * 20) / 13).toFixed(2)}h30v${(20 / 13).toFixed(2)}h-30z`)
  .join("");

function contenu(region: string) {
  switch (region) {
    case "Italienne":
      return bandesVerticales(["#009246", "#FFFFFF", "#CE2B37"]);
    case "Française":
      return bandesVerticales(["#0055A4", "#FFFFFF", "#EF4135"]);
    case "Mexicaine":
      return (
        <>
          {bandesVerticales(["#006847", "#FFFFFF", "#CE1126"])}
          <circle cx={15} cy={10} r={2.6} fill="#8B5A2B" />
        </>
      );
    case "Espagnole":
      return bandesHorizontales(["#AA151B", "#F1BF00", "#AA151B"], 10);
    case "Indienne":
      return (
        <>
          {bandesHorizontales(["#FF9933", "#FFFFFF", "#138808"])}
          <circle cx={15} cy={10} r={2.4} fill="none" stroke="#000080" strokeWidth={0.8} />
        </>
      );
    case "Japonaise":
      return (
        <>
          <rect width={30} height={20} fill="#FFFFFF" />
          <circle cx={15} cy={10} r={6} fill="#BC002D" />
        </>
      );
    case "Chinoise":
      return (
        <>
          <rect width={30} height={20} fill="#EE1C25" />
          <polygon points={etoile(5, 5, 3)} fill="#FFDE00" />
          {[
            [10, 2],
            [12, 4],
            [12, 7],
            [10, 9],
          ].map(([x, y]) => (
            <polygon key={`${x}-${y}`} points={etoile(x, y, 1)} fill="#FFDE00" />
          ))}
        </>
      );
    case "Américaine":
      return (
        <>
          <rect width={30} height={20} fill="#FFFFFF" />
          <path d={BANDES_USA} fill="#B22234" />
          <rect width={12} height={(20 * 7) / 13} fill="#3C3B6E" />
          {[2, 5, 8, 11].flatMap((x) =>
            [2.2, 5.4, 8.6].map((y) => <circle key={`${x}-${y}`} cx={x - 0.5} cy={y} r={0.55} fill="#FFFFFF" />),
          )}
        </>
      );
    case "Marocaine":
      return (
        <>
          <rect width={30} height={20} fill="#C1272D" />
          <polygon points={etoile(15, 10.5, 5)} fill="none" stroke="#006233" strokeWidth={1} />
        </>
      );
    default:
      return <rect width={30} height={20} fill="#CCCCCC" />;
  }
}

interface DrapeauProps {
  region: string;
  taille?: number; // largeur en pixels
}

export default function Drapeau({ region, taille = 20 }: DrapeauProps) {
  return (
    <svg className="drapeau" width={taille} height={(taille * 2) / 3} viewBox="0 0 30 20" aria-hidden="true">
      {contenu(region)}
    </svg>
  );
}
