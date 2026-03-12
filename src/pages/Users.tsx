import { useEffect, useState } from "react";
import { Search, Eye, X, Star, ShoppingBag } from "lucide-react";
import { supabase, formatPrice } from "../lib/supabase";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

interface Profile {
  id: string;
  name: string;
  phone: string;
  city: string;
  loyalty_points: number;
  referral_code: string;
  referral_by: string;
  created_at: string;
  role?: string;
}

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Profile | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const openDetail = async (user: Profile) => {
    setDetail(user);
    setLoadingOrders(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setUserOrders(data || []);
    setLoadingOrders(false);
  };

  const filtered = users.filter(
    (u) =>
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.referral_code || "").toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-warning",
      completed: "badge-success",
      cancelled: "badge-danger",
    };
    return (
      <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>
    );
  };

  return (
    <Layout title="Pengguna" subtitle={`${users.length} pengguna terdaftar`}>
      <div className="relative mb-6 max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#6b6b60" }}
        />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Cari pengguna..."
          className="input-field pl-9"
        />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Pengguna</th>
              <th className="hide-mobile">Kota</th>
              <th className="hide-tablet">Referral Code</th>
              <th className="hide-mobile">Poin</th>
              <th className="hide-mobile">Bergabung</th>
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
              : paginated.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: "#D4AF3720",
                            color: "#D4AF37",
                            border: "1px solid #D4AF3730",
                          }}
                        >
                          {(user.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ color: "#EFEFE9", fontWeight: 500 }}>
                            {user.name || "—"}
                          </p>
                          {user.phone && (
                            <p className="text-xs" style={{ color: "#6b6b60" }}>
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ color: "#c8c8c0" }}>{user.city || "—"}</td>
                    <td className="hide-tablet">
                      <span style={{ fontSize: 11, color: "#D4AF37" }}>
                        {user.referral_code || "—"}
                      </span>
                    </td>
                    <td className="hide-mobile">
                      <div className="flex items-center gap-1">
                        <Star size={11} style={{ color: "#D4AF37" }} />
                        <span style={{ fontSize: 12 }}>
                          {user.loyalty_points ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(user.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td>
                      <button
                        onClick={() => openDetail(user)}
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
                  Tidak ada pengguna.
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
                Detail Pengguna
              </h3>
              <button
                onClick={() => setDetail(null)}
                style={{ color: "#6b6b60" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {/* Avatar + info */}
              <div
                className="flex items-center gap-4 mb-6 p-4"
                style={{ background: "#0f0f0d", border: "1px solid #2a2a26" }}
              >
                <div
                  className="w-14 h-14 flex items-center justify-center text-2xl font-bold"
                  style={{
                    background: "#D4AF3715",
                    color: "#D4AF37",
                    border: "1px solid #D4AF3730",
                  }}
                >
                  {(detail.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: "#EFEFE9" }}>
                    {detail.name || "—"}
                  </h4>
                  {detail.phone && (
                    <p className="text-sm" style={{ color: "#6b6b60" }}>
                      {detail.phone}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#6b6b60" }}>
                    ID: <span>{detail.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Kota", value: detail.city || "—" },
                  {
                    label: "Poin Loyalitas",
                    value: `${detail.loyalty_points ?? 0} pts`,
                  },
                  {
                    label: "Referral Code",
                    value: detail.referral_code || "—",
                    mono: true,
                  },
                  {
                    label: "Direferralkan oleh",
                    value: detail.referral_by || "—",
                    mono: true,
                  },
                  {
                    label: "Bergabung",
                    value: new Date(detail.created_at).toLocaleDateString(
                      "id-ID",
                    ),
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label}>
                    <p
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ color: "#6b6b60" }}
                    >
                      {label}
                    </p>
                    <p className="text-sm" style={{ color: "#EFEFE9" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div>
                <p
                  className="text-xs uppercase tracking-wider mb-3 flex items-center gap-2"
                  style={{ color: "#6b6b60" }}
                >
                  <ShoppingBag size={12} /> Pesanan Terakhir
                </p>
                {loadingOrders ? (
                  <div
                    className="h-16 animate-pulse"
                    style={{ background: "#1e1e1b" }}
                  />
                ) : userOrders.length === 0 ? (
                  <p
                    className="text-sm text-center py-6"
                    style={{ color: "#6b6b60" }}
                  >
                    Belum ada pesanan.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {userOrders.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-center justify-between p-3"
                        style={{ border: "1px solid #2a2a26" }}
                      >
                        <div>
                          <span style={{ fontSize: 11, color: "#D4AF37" }}>
                            {o.order_number}
                          </span>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#6b6b60" }}
                          >
                            {new Date(o.created_at).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p style={{ fontSize: 12 }}>
                            {formatPrice(o.total_price)}
                          </p>
                          {statusBadge(o.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: "badge-warning",
    completed: "badge-success",
    cancelled: "badge-danger",
  };
  return (
    <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>
  );
}
