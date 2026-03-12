import { useEffect, useState } from "react";
import { Mail, MailOpen, Search, X, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Supports both contact_messages and contact_inquiries tables
export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    // Try contact_messages first
    let { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    // Fallback if error or no data found in the first table
    if (error || !data || data.length === 0) {
      if (error) console.error("contact_messages error:", error);

      const res = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!res.error && res.data && res.data.length > 0) {
        data = res.data.map((d) => ({ ...d, is_read: d.is_read ?? false }));
      }
    }

    setMessages(data || []);
    setLoading(false);
  };

  const openDetail = async (msg: Message) => {
    setDetail(msg);
    // Mark as read if has is_read column
    if (!msg.is_read) {
      await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)),
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    // Try both tables
    let error = (
      await supabase.from("contact_messages").delete().eq("id", deleteId)
    ).error;
    if (error)
      error = (
        await supabase.from("contact_inquiries").delete().eq("id", deleteId)
      ).error;
    if (error) toast.error(error.message);
    else {
      toast.success("Pesan dihapus!");
      fetchMessages();
      if (detail?.id === deleteId) setDetail(null);
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const filtered = messages.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "unread" ? !m.is_read : m.is_read);
    return matchSearch && matchFilter;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <Layout title="Pesan Masuk" subtitle={`${unreadCount} pesan belum dibaca`}>
      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6b6b60" }}
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari pesan..."
            className="input-field pl-9"
            style={{ width: 240 }}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 text-xs border transition-all uppercase tracking-wider ${filter === f ? "border-amber-400 text-amber-400 bg-amber-400/5" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}
            >
              {f === "all"
                ? "Semua"
                : f === "unread"
                  ? "Belum Dibaca"
                  : "Dibaca"}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>Pengirim</th>
              <th className="hide-mobile">Subjek</th>
              <th className="hide-mobile">Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div
                        className="h-10 animate-pulse"
                        style={{ background: "#1e1e1b" }}
                      />
                    </td>
                  </tr>
                ))
              : paginated.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => openDetail(msg)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      {msg.is_read ? (
                        <MailOpen size={14} style={{ color: "#6b6b60" }} />
                      ) : (
                        <Mail size={14} style={{ color: "#D4AF37" }} />
                      )}
                    </td>
                    <td>
                      <p
                        style={{
                          color: msg.is_read ? "#c8c8c0" : "#EFEFE9",
                          fontWeight: msg.is_read ? 400 : 600,
                        }}
                      >
                        {msg.name}
                      </p>
                      <p className="text-xs" style={{ color: "#6b6b60" }}>
                        {msg.email}
                      </p>
                    </td>
                    <td className="hide-mobile" style={{ color: msg.is_read ? "#6b6b60" : "#c8c8c0" }}>
                      {msg.subject || "—"}
                    </td>
                    <td className="hide-mobile" style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(msg.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteId(msg.id)}
                        className="w-7 h-7 flex items-center justify-center"
                        style={{ color: "#6b6b60" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#ef4444")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#6b6b60")
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12"
                  style={{ color: "#6b6b60" }}
                >
                  Tidak ada pesan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div
            className="modal-content animate-in"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #2a2a26" }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: "#EFEFE9" }}
              >
                Detail Pesan
              </h3>
              <button
                onClick={() => setDetail(null)}
                style={{ color: "#6b6b60" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div
                className="grid grid-cols-2 gap-4 mb-6 p-4"
                style={{ background: "#0f0f0d", border: "1px solid #2a2a26" }}
              >
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Nama
                  </p>
                  <p className="font-semibold" style={{ color: "#EFEFE9" }}>
                    {detail.name}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Email
                  </p>
                  <a
                    href={`mailto:${detail.email}`}
                    className="text-sm"
                    style={{ color: "#3b82f6" }}
                  >
                    {detail.email}
                  </a>
                </div>
                {detail.subject && (
                  <div className="col-span-2">
                    <p
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ color: "#6b6b60" }}
                    >
                      Subjek
                    </p>
                    <p style={{ color: "#c8c8c0" }}>{detail.subject}</p>
                  </div>
                )}
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Tanggal
                  </p>
                  <p className="text-sm" style={{ color: "#6b6b60" }}>
                    {new Date(detail.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: "#6b6b60" }}
                >
                  Pesan
                </p>
                <div
                  className="p-4 leading-relaxed"
                  style={{
                    background: "#0f0f0d",
                    border: "1px solid #2a2a26",
                    color: "#c8c8c0",
                    fontSize: 14,
                  }}
                >
                  {detail.message}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setDeleteId(detail.id);
                    setDetail(null);
                  }}
                  className="btn-danger"
                >
                  <Trash2 size={13} /> Hapus Pesan
                </button>
                <a
                  href={`mailto:${detail.email}?subject=Re: ${detail.subject || "Pesan dari BrewByte"}`}
                  className="btn-primary"
                  style={{ textDecoration: "none" }}
                >
                  <Mail size={13} /> Balas via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Pesan"
        message="Pesan yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
