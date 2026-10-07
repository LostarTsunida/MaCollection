interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="bouton bouton-secondaire" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Précédent
      </button>
      <span>
        Page {page} / {totalPages}
      </span>
      <button className="bouton bouton-secondaire" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Suivant →
      </button>
    </nav>
  );
}
