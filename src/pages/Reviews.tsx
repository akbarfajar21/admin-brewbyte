import { useEffect, useState } from "react";
import { Search, Trash2, Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: { name: string };
  products?: { name: string };
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch raw reviews
      const { data: reviewsData, error } = await supabase
        .from("product_reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviews = reviewsData || [];

      // Step 2: Collect unique user_ids and product_ids
      const userIds = [...new Set(reviews.map((r: any) => r.user_id).filter(Boolean))];
      const productIds = [...new Set(reviews.map((r: any) => r.product_id).filter(Boolean))];

      // Step 3: Fetch profiles and products separately (avoids RLS join issue)
      let profilesMap: Record<string, { name: string }> = {};
      let productsMap: Record<string, { name: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map((p: any) => [p.id, p]));
        }
      }

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name")
          .in("id", productIds);
        if (productsData) {
          productsMap = Object.fromEntries(productsData.map((p: any) => [p.id, p]));
        }
      }

      // Step 4: Merge into reviews
      const merged = reviews.map((r: any) => ({
        ...r,
        profiles: profilesMap[r.user_id] || null,
        products: productsMap[r.product_id] || null,
      }));

      setReviews(merged);
    } catch (err: any) {
      console.error("Review fetch error:", err);
      toast.error("Gagal mengambil data ulasan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", deleteId);
    if (error) toast.error(error.message);
    else {
      toast.success("Ulasan dihapus!");
      fetchReviews();
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const filtered = reviews.filter(
    (r) =>
      (r.comment || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.profiles?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.products?.name || "").toLowerCase().includes(search.toLowerCase()),
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
    <Layout title="Ulasan Produk" subtitle={`${reviews.length} ulasan`}>
      <div className="relative mb-6 max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#6b6b60" }}
        />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari ulasan..."
          className="input-field pl-9"
        />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Pengguna</th>
              <th className="hide-mobile">Produk</th>
              <th>Rating</th>
              <th>Komentar</th>
              <th className="hide-mobile">Tanggal</th>
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
              : paginated.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "#EFEFE9", fontWeight: 500 }}>
                      {r.profiles?.name || "Anonymous"}
                    </td>
                    <td className="hide-mobile">
                      <span className="badge badge-muted">
                        {r.products?.name || "—"}
                      </span>
                    </td>
                    <td>{renderStars(r.rating)}</td>
                    <td style={{ maxWidth: 280 }}>
                      <p
                        className="text-sm truncate"
                        style={{ color: "#c8c8c0" }}
                      >
                        {r.comment}
                      </p>
                    </td>
                    <td className="hide-mobile" style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteId(r.id)}
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
                  colSpan={6}
                  className="text-center py-12"
                  style={{ color: "#6b6b60" }}
                >
                  Tidak ada ulasan.
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
        title="Hapus Ulasan"
        message="Ulasan yang dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </Layout>
  );
}
