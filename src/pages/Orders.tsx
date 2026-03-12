import { useEffect, useState } from "react";
import { Search, Eye, X, ChevronDown } from "lucide-react";
import { supabase, formatPrice } from "../lib/supabase";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_price: number;
  status: string;
  note: string;
  payment_link: string;
  payment_id: string;
  created_at: string;
  profiles?: { name: string; email?: string };
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  customizations: Record<string, string>;
  products?: { image_url: string };
}

const STATUSES = ["pending", "processing", "completed", "cancelled"];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: "badge-warning",
    processing: "badge-info",
    completed: "badge-success",
    cancelled: "badge-danger",
  };
  return (
    <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch orders with items and product images
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*, order_items(*, products(image_url))")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const orders = ordersData || [];

      // Step 2: Collect unique user_ids
      const userIds = [...new Set(orders.map((o: any) => o.user_id).filter(Boolean))];

      // Step 3: Fetch profiles separately (avoids RLS join issue)
      let profilesMap: Record<string, { name: string; email?: string }> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);

        if (profilesData) {
          profilesMap = Object.fromEntries(profilesData.map((p: any) => [p.id, p]));
        }
      }

      // Step 4: Merge profiles into orders manually
      const merged = orders.map((o: any) => ({
        ...o,
        profiles: profilesMap[o.user_id] || null,
      }));

      setOrders(merged);
    } catch (err: any) {
      console.error("Order fetch error:", err);
      toast.error("Gagal mengambil data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) toast.error(error.message);
    else {
      toast.success("Status diperbarui!");
      if (detail) setDetail((prev) => (prev ? { ...prev, status } : null));
      fetchOrders();
    }
    setUpdatingStatus(false);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      (o.profiles?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Layout
      title="Manajemen Pesanan"
      subtitle={`${orders.length} total pesanan`}
    >
      {/* Filters */}
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
            placeholder="Cari nomor / nama..."
            className="input-field pl-9"
            style={{ width: 240 }}
          />
        </div>
        <div className="flex gap-2">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs border transition-all uppercase tracking-wider ${statusFilter === s ? "border-amber-400 text-amber-400 bg-amber-400/5" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}
            >
              {s === "all" ? "Semua" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>No. Pesanan</th>
              <th>Pelanggan</th>
              <th className="hide-mobile">Total</th>
              <th>Status</th>
              <th className="hide-mobile">Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div
                        className="h-10 animate-pulse"
                        style={{ background: "#1e1e1b" }}
                      />
                    </td>
                  </tr>
                ))
              : paginated.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontSize: 12, color: "#D4AF37" }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td style={{ color: "#EFEFE9" }}>
                      {order.profiles?.name || "—"}
                    </td>
                    <td className="hide-mobile">
                      <span style={{ fontSize: 12 }}>
                        {formatPrice(order.total_price)}
                      </span>
                    </td>
                    <td>{statusBadge(order.status)}</td>
                    <td className="hide-mobile" style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => setDetail(order)}
                        className="w-7 h-7 flex items-center justify-center"
                        style={{ color: "#6b6b60" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "#D4AF37")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "#6b6b60")
                        }
                      >
                        <Eye size={14} />
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
                  Tidak ada pesanan.
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
            style={{ maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid #2a2a26" }}
            >
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#EFEFE9" }}
                >
                  Detail Pesanan
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "#D4AF37" }}>
                  {detail.order_number}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                style={{ color: "#6b6b60" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Info */}
              <div
                className="grid grid-cols-2 gap-4 mb-6 p-4"
                style={{ background: "#0f0f0d", border: "1px solid #2a2a26" }}
              >
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Pelanggan
                  </p>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#EFEFE9" }}
                  >
                    {detail.profiles?.name || "—"}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Total
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#D4AF37" }}>
                    {formatPrice(detail.total_price)}
                  </p>
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Tanggal
                  </p>
                  <p className="text-sm" style={{ color: "#c8c8c0" }}>
                    {new Date(detail.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {detail.payment_link && (
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ color: "#6b6b60" }}
                    >
                      Payment Link
                    </p>
                    <a
                      href={detail.payment_link}
                      target="_blank"
                      rel="noopener"
                      className="text-xs"
                      style={{ color: "#3b82f6" }}
                    >
                      Buka Link
                    </a>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="mb-6">
                <label
                  className="block text-xs uppercase tracking-wider mb-2"
                  style={{ color: "#6b6b60" }}
                >
                  Update Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(detail.id, s)}
                      disabled={updatingStatus || detail.status === s}
                      className={`px-3 py-1.5 text-xs border transition-all uppercase tracking-wider disabled:opacity-40 ${detail.status === s ? "border-amber-400 text-amber-400 bg-amber-400/10" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{ color: "#6b6b60" }}
                >
                  Item Pesanan
                </p>
                <div className="flex flex-col gap-3">
                  {detail.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3"
                      style={{ border: "1px solid #2a2a26" }}
                    >
                      {item.products?.image_url && (
                        <img
                          src={item.products.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#EFEFE9" }}
                        >
                          {item.product_name}
                        </p>
                        {item.customizations &&
                          Object.keys(item.customizations).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.customizations).map(
                                ([k, v]) => (
                                  <span
                                    key={k}
                                    className="badge badge-gold"
                                    style={{ fontSize: 9 }}
                                  >
                                    {v}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        <div className="flex justify-between mt-1">
                          <p className="text-xs" style={{ color: "#6b6b60" }}>
                            {item.quantity} × {formatPrice(item.product_price)}
                          </p>
                          <p
                            className="text-xs font-mono"
                            style={{ color: "#D4AF37" }}
                          >
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detail.note && (
                <div
                  className="mt-4 p-3"
                  style={{ background: "#0f0f0d", border: "1px solid #2a2a26" }}
                >
                  <p
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "#6b6b60" }}
                  >
                    Catatan
                  </p>
                  <p className="text-sm" style={{ color: "#c8c8c0" }}>
                    {detail.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
