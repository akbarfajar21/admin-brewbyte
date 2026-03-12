import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Hapus",
  loading,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div
        className="animate-in"
        style={{
          background: "#161614",
          border: "1px solid #2a2a26",
          width: "100%",
          maxWidth: 400,
          padding: "2rem",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ background: "#ef444415", border: "1px solid #ef444430" }}
          >
            <AlertTriangle size={18} style={{ color: "#ef4444" }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: "#EFEFE9" }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-6" style={{ color: "#6b6b60" }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline" disabled={loading}>
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
            style={{ background: "#ef4444", color: "white" }}
            disabled={loading}
          >
            {loading ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
