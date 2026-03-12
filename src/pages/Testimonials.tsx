import { useEffect, useState } from "react";
import { Search, Trash2, Star, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  image_url: string;
  created_at: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err: any) {
      console.error("Error fetching testimonials:", err);
      toast.error("Gagal mengambil data testimoni: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Testimoni dihapus!");
      fetchTestimonials();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const filtered = testimonials.filter(
    (t) =>
      (t.content || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.role || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={11}
          style={{
            color: i < rating ? "#D4AF37" : "#2a2a26",
            fill: i < rating ? "#D4AF37" : "transparent",
          }}
        />
      ))}
    </div>
  );

  return (
    <Layout title="Testimoni Pelanggan" subtitle={`${testimonials.length} testimoni`}>
      <div className="relative mb-6 max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#6b6b60" }}
        />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari testimoni..."
          className="input-field pl-9"
        />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Role</th>
              <th>Rating</th>
              <th>Konten</th>
              <th>Tanggal</th>
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
              : paginated.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-brew-bg/50 border border-brew-border flex items-center justify-center">
                          {t.image_url ? (
                            <img src={t.image_url} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={14} className="text-brew-muted" />
                          )}
                        </div>
                        <span style={{ color: "#EFEFE9", fontWeight: 500 }}>
                          {t.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-muted">
                        {t.role || "Coffee Lover"}
                      </span>
                    </td>
                    <td>{renderStars(t.rating)}</td>
                    <td style={{ maxWidth: 280 }}>
                      <p
                        className="text-sm truncate"
                        style={{ color: "#c8c8c0" }}
                        title={t.content}
                      >
                        {t.content}
                      </p>
                    </td>
                    <td style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(t.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteId(t.id)}
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
                  Tidak ada testimoni.
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

      <ConfirmModal
        open={!!deleteId}
        title="Hapus Testimoni"
        message="Testimoni yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
