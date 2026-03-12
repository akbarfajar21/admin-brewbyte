import { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X } from "lucide-react";
import { supabase, formatPrice } from "../lib/supabase";
import Layout from "../components/Layout";
import ImageUpload from "../components/ImageUpload";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  description: string;
  long_description: string;
  image_url: string;
  tags: string[];
  ingredients: string[];
  is_popular: boolean;
  is_new: boolean;
  is_available: boolean;
  created_at: string;
  categories?: { name: string };
}

interface Category {
  id: number;
  name: string;
}

const empty = (): Partial<Product> => ({
  name: "",
  category_id: undefined,
  price: 0,
  description: "",
  long_description: "",
  image_url: "",
  tags: [],
  ingredients: [],
  is_popular: false,
  is_new: false,
  is_available: true,
});

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Product>>(empty());
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setLoading(false);
  };

  const openCreate = () => {
    const e = empty();
    setEditItem(e);
    setTagsInput("");
    setIngredientsInput("");
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditItem({ ...p });
    setTagsInput(p.tags?.join(", ") || "");
    setIngredientsInput(p.ingredients?.join(", ") || "");
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editItem.name || !editItem.category_id || !editItem.price) {
      toast.error("Nama, kategori, dan harga wajib diisi.");
      return;
    }
    setSaving(true);
    const payload = {
      ...editItem,
      tags: tagsInput
        ? tagsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      ingredients: ingredientsInput
        ? ingredientsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    delete (payload as any).categories;
    delete (payload as any).id;
    delete (payload as any).created_at;

    let error;
    if (isEditing && editItem.id) {
      ({ error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editItem.id));
    } else {
      ({ error } = await supabase.from("products").insert([payload]));
    }

    if (error) toast.error(error.message);
    else {
      toast.success(isEditing ? "Produk diperbarui!" : "Produk ditambahkan!");
      setModalOpen(false);
      fetchAll();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Produk dihapus!");
      fetchAll();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const toggleAvailable = async (p: Product) => {
    await supabase
      .from("products")
      .update({ is_available: !p.is_available })
      .eq("id", p.id);
    fetchAll();
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categories?.name || "").toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout
      title="Manajemen Produk"
      subtitle={`${products.length} produk terdaftar`}
      actions={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} />
          Tambah Produk
        </button>
      }
    >
      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6b6b60" }}
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari produk..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th className="hide-mobile">Kategori</th>
              <th>Harga</th>
              <th className="hide-mobile">Status</th>
              <th className="hide-tablet">Label</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div
                        className="h-10 animate-pulse"
                        style={{ background: "#1e1e1b" }}
                      />
                    </td>
                  </tr>
                ))
              : paginated.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 object-cover flex-shrink-0"
                            style={{ border: "1px solid #2a2a26" }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 flex-shrink-0"
                            style={{ background: "#2a2a26" }}
                          />
                        )}
                        <span style={{ color: "#EFEFE9", fontWeight: 500 }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <span className="badge badge-muted">
                        {p.categories?.name || "—"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "#D4AF37" }}>
                        {formatPrice(p.price)}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <span
                        className={`badge ${p.is_available ? "badge-success" : "badge-muted"}`}
                      >
                        {p.is_available ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="hide-tablet">
                      <div className="flex gap-1">
                        {p.is_new && (
                          <span className="badge badge-gold">Baru</span>
                        )}
                        {p.is_popular && (
                          <span className="badge badge-info">Populer</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAvailable(p)}
                          title={p.is_available ? "Nonaktifkan" : "Aktifkan"}
                          className="w-7 h-7 flex items-center justify-center transition-colors"
                          style={{ color: "#6b6b60" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = "#D4AF37")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#6b6b60")
                          }
                        >
                          {p.is_available ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="w-7 h-7 flex items-center justify-center transition-colors"
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
                          onClick={() => setDeleteId(p.id)}
                          className="w-7 h-7 flex items-center justify-center transition-colors"
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
                  Tidak ada produk ditemukan.
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
            style={{ maxWidth: 700 }}
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
                {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
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
                bucket="product-images"
                folder="products"
                label="Gambar Produk"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Nama Produk *
                  </label>
                  <input
                    value={editItem.name || ""}
                    onChange={(e) =>
                      setEditItem((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Nama produk"
                  />
                </div>
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Kategori *
                  </label>
                  <select
                    value={editItem.category_id || ""}
                    onChange={(e) =>
                      setEditItem((p) => ({
                        ...p,
                        category_id: Number(e.target.value),
                      }))
                    }
                    className="input-field"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Harga *
                </label>
                <input
                  type="number"
                  value={editItem.price || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({
                      ...p,
                      price: Number(e.target.value),
                    }))
                  }
                  className="input-field"
                  placeholder="25000"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Deskripsi Singkat
                </label>
                <input
                  value={editItem.description || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({ ...p, description: e.target.value }))
                  }
                  className="input-field"
                  placeholder="Deskripsi singkat produk"
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-wider mb-1.5"
                  style={{ color: "#6b6b60" }}
                >
                  Deskripsi Lengkap
                </label>
                <textarea
                  value={editItem.long_description || ""}
                  onChange={(e) =>
                    setEditItem((p) => ({
                      ...p,
                      long_description: e.target.value,
                    }))
                  }
                  className="input-field"
                  rows={3}
                  placeholder="Deskripsi lengkap produk..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Tags (pisah koma)
                  </label>
                  <input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="input-field"
                    placeholder="arabika, medium roast, ..."
                  />
                </div>
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider mb-1.5"
                    style={{ color: "#6b6b60" }}
                  >
                    Bahan (pisah koma)
                  </label>
                  <input
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    className="input-field"
                    placeholder="espresso, susu, ..."
                  />
                </div>
              </div>

              <div className="flex gap-6">
                {[
                  { key: "is_new", label: "Produk Baru" },
                  { key: "is_popular", label: "Populer" },
                  { key: "is_available", label: "Tersedia" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={!!(editItem as any)[key]}
                      onChange={(e) =>
                        setEditItem((p) => ({ ...p, [key]: e.target.checked }))
                      }
                      className="w-4 h-4 accent-amber-400"
                    />
                    <span className="text-sm" style={{ color: "#c8c8c0" }}>
                      {label}
                    </span>
                  </label>
                ))}
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
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Produk"
        message="Produk yang dihapus tidak dapat dikembalikan. Lanjutkan?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
