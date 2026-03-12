import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Category>>({
    name: "",
    slug: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(data || []);
    setLoading(false);
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const openCreate = () => {
    setEditItem({ name: "", slug: "" });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditItem({ ...c });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editItem.name) {
      toast.error("Nama wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      name: editItem.name,
      slug: editItem.slug || slugify(editItem.name || ""),
    };

    let error;
    if (isEditing && editItem.id) {
      ({ error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("categories").insert([payload]));
    }

    if (error) toast.error(error.message);
    else {
      toast.success(
        isEditing ? "Kategori diperbarui!" : "Kategori ditambahkan!",
      );
      setModalOpen(false);
      fetchAll();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Kategori dihapus!");
      fetchAll();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <Layout
      title="Kategori"
      subtitle={`${categories.length} kategori`}
      actions={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} />
          Tambah Kategori
        </button>
      }
    >
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>Slug</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div
                        className="h-8 animate-pulse"
                        style={{ background: "#1e1e1b" }}
                      />
                    </td>
                  </tr>
                ))
              : categories.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: "#6b6b60", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ color: "#EFEFE9", fontWeight: 500 }}>
                      {c.name}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#6b6b60" }}>
                        {c.slug}
                      </span>
                    </td>
                    <td style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(c.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
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
                          onClick={() => setDeleteId(c.id)}
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
            {!loading && categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12"
                  style={{ color: "#6b6b60" }}
                >
                  Belum ada kategori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content animate-in"
            style={{ maxWidth: 400 }}
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
                {isEditing ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ color: "#6b6b60" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Nama *
                </label>
                <input
                  value={editItem.name || ""}
                  onChange={(e) => {
                    setEditItem((p) => ({
                      ...p,
                      name: e.target.value,
                      slug: slugify(e.target.value),
                    }));
                  }}
                  className="input-field"
                  placeholder="Nama kategori"
                />
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
                  placeholder="nama-kategori"
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
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Kategori"
        message="Kategori yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
