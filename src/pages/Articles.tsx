import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ImageUpload from "../components/ImageUpload";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image_url: string;
  slug: string;
  created_at: string;
}

const emptyArticle = (): Partial<Article> => ({
  title: "",
  excerpt: "",
  content: "",
  category: "",
  author: "",
  image_url: "",
  slug: "",
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Article>>(emptyArticle());
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    setArticles(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditItem(emptyArticle());
    setIsEditing(false);
    setModalOpen(true);
  };
  const openEdit = (a: Article) => {
    setEditItem({ ...a });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editItem.title || !editItem.author || !editItem.content) {
      toast.error("Judul, penulis, dan konten wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      ...editItem,
      slug: editItem.slug || slugify(editItem.title || ""),
    };
    delete (payload as any).id;
    delete (payload as any).created_at;

    let error;
    if (isEditing && editItem.id) {
      ({ error } = await supabase
        .from("articles")
        .update(payload)
        .eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("articles").insert([payload]));
    }

    if (error) toast.error(error.message);
    else {
      toast.success(isEditing ? "Artikel diperbarui!" : "Artikel ditambahkan!");
      setModalOpen(false);
      fetchAll();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Artikel dihapus!");
      fetchAll();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      (a.category || "").toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout
      title="Artikel / Blog"
      subtitle={`${articles.length} artikel`}
      actions={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} />
          Tulis Artikel
        </button>
      }
    >
      <div className="relative mb-6 max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#6b6b60" }}
        />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari artikel..."
          className="input-field pl-9"
        />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Artikel</th>
              <th>Kategori</th>
              <th>Penulis</th>
              <th>Slug</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div
                        className="h-10 animate-pulse"
                        style={{ background: "#1e1e1b" }}
                      />
                    </td>
                  </tr>
                ))
              : paginated.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt={a.title}
                            className="w-12 h-8 object-cover flex-shrink-0"
                            style={{ border: "1px solid #2a2a26" }}
                          />
                        ) : (
                          <div
                            className="w-12 h-8 flex-shrink-0"
                            style={{ background: "#2a2a26" }}
                          />
                        )}
                        <p
                          className="font-medium line-clamp-1"
                          style={{ color: "#EFEFE9", maxWidth: 200 }}
                        >
                          {a.title}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-muted">
                        {a.category || "—"}
                      </span>
                    </td>
                    <td style={{ color: "#c8c8c0" }}>{a.author}</td>
                    <td>
                      <span style={{ fontSize: 11, color: "#6b6b60" }}>
                        {a.slug}
                      </span>
                    </td>
                    <td style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(a.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(a)}
                          className="w-7 h-7 flex items-center justify-center"
                          style={{ color: "#6b6b60" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#3b82f6")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#6b6b60")
                          }
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
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
                      </div>
                    </td>
                  </tr>
                ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12"
                  style={{ color: "#6b6b60" }}
                >
                  Tidak ada artikel.
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

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content animate-in"
            style={{ maxWidth: 720 }}
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
                {isEditing ? "Edit Artikel" : "Tulis Artikel Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ color: "#6b6b60" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <ImageUpload
                value={editItem.image_url}
                onChange={(url) =>
                  setEditItem((p) => ({ ...p, image_url: url }))
                }
                bucket="article-images"
                folder="articles"
                label="Gambar Artikel"
              />

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Judul *
                </label>
                <input
                  value={editItem.title || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({
                      ...p,
                      title: e.target.value,
                      slug: slugify(e.target.value),
                    }))
                  }
                  className="input-field"
                  placeholder="Judul artikel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Penulis *
                  </label>
                  <input
                    value={editItem.author || ""}
                    onChange={(e) =>
                      setEditItem((p) => ({ ...p, author: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Nama penulis"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Kategori
                  </label>
                  <input
                    value={editItem.category || ""}
                    onChange={(e) =>
                      setEditItem((p) => ({ ...p, category: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Brewing Guide, Tips, ..."
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Slug
                </label>
                <input
                  value={editItem.slug || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="input-field"
                  placeholder="url-artikel"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Excerpt
                </label>
                <textarea
                  value={editItem.excerpt || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, excerpt: e.target.value }))
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Ringkasan singkat artikel..."
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Konten * (HTML diperbolehkan)
                </label>
                <textarea
                  value={editItem.content || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, content: e.target.value }))
                  }
                  className="input-field"
                  rows={8}
                  placeholder="Konten lengkap artikel..."
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>
            <div
              className="flex justify-end gap-3 px-6 py-4"
              style={{ borderTop: "1px solid #2a2a26" }}
            >
              <button
                onClick={() => setModalOpen(false)}
                className="btn-outline"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Menyimpan..." : "Publikasikan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Artikel"
        message="Artikel yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
