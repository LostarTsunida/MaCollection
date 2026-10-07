import type { Statut } from "../types/api";
import { LIBELLES_STATUT } from "../utils/format";

export default function StatutBadge({ statut }: { statut: Statut }) {
  return <span className={`badge badge-${statut}`}>{LIBELLES_STATUT[statut]}</span>;
}
