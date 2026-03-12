import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Build page number list with ellipsis
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    fontSize: 12,
    border: "1px solid #2a2a26",
    background: "transparent",
    color: "#6b6b60",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    border: "1px solid #D4AF37",
    color: "#D4AF37",
    background: "#D4AF3710",
  };

  return (
    <div
      className="flex items-center justify-between mt-4 pt-4"
      style={{ borderTop: "1px solid #2a2a26" }}
    >
      <p className="text-xs" style={{ color: "#6b6b60" }}>
        Menampilkan <span style={{ color: "#EFEFE9" }}>{from}–{to}</span> dari{" "}
        <span style={{ color: "#EFEFE9" }}>{totalItems}</span> data
      </p>

      <div className="flex items-center gap-1">
        <button
          style={btnBase}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          onMouseEnter={(e) => { if (currentPage !== 1) e.currentTarget.style.color = "#EFEFE9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b60"; }}
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ color: "#6b6b60", padding: "0 4px", fontSize: 12 }}>
              ···
            </span>
          ) : (
            <button
              key={p}
              style={p === currentPage ? btnActive : btnBase}
              onClick={() => onPageChange(p as number)}
              onMouseEnter={(e) => { if (p !== currentPage) e.currentTarget.style.color = "#EFEFE9"; }}
              onMouseLeave={(e) => { if (p !== currentPage) e.currentTarget.style.color = "#6b6b60"; }}
            >
              {p}
            </button>
          )
        )}

        <button
          style={btnBase}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          onMouseEnter={(e) => { if (currentPage !== totalPages) e.currentTarget.style.color = "#EFEFE9"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b6b60"; }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
