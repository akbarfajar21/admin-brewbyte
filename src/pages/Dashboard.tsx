import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  FileText,
  Tag,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase, formatPrice } from "../lib/supabase";
import Layout from "../components/Layout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalReviews: number;
  totalTestimonials: number;
  totalArticles: number;
  totalMessages: number;
  unreadMessages: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  user_id: string;
  total_price: number;
  status: string;
  created_at: string;
  customerName?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalReviews: 0,
    totalTestimonials: 0,
    totalArticles: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch all data in parallel
    const [
      ordersRes,
      usersRes,
      productsRes,
      categoriesRes,
      reviewsRes,
      testimonialsRes,
      articlesRes,
      messagesRes,
    ] = await Promise.all([
      supabase.from("orders").select("id, user_id, total_price, status, created_at, order_number"),
      supabase.from("profiles").select("id"),
      supabase.from("products").select("id"),
      supabase.from("categories").select("id"),
      supabase.from("product_reviews").select("id"),
      supabase.from("testimonials").select("id"),
      supabase.from("articles").select("id"),
      supabase.from("contact_messages").select("id, is_read"),
    ]);

    const orders = ordersRes.data || [];
    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);

    // Chart data - last 7 days
    const today = new Date();
    const days: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
      days[key] = { revenue: 0, orders: 0 };
    }
    orders.forEach((o) => {
      const key = new Date(o.created_at).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
      });
      if (days[key]) {
        days[key].orders += 1;
        if (o.status === "completed") days[key].revenue += o.total_price;
      }
    });

    setStats({
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: completedOrders.length,
      totalUsers: usersRes.data?.length || 0,
      totalProducts: productsRes.data?.length || 0,
      totalCategories: categoriesRes.data?.length || 0,
      totalReviews: reviewsRes.data?.length || 0,
      totalTestimonials: testimonialsRes.data?.length || 0,
      totalArticles: articlesRes.data?.length || 0,
      totalMessages: messagesRes.data?.length || 0,
      unreadMessages: (messagesRes.data || []).filter((m) => !m.is_read).length,
    });

    setChartData(Object.entries(days).map(([date, val]) => ({ date, ...val })));

    // Fetch recent orders and merge customer names separately
    const recent = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    const userIds = [...new Set(recent.map((o) => o.user_id).filter(Boolean))];
    let profilesMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);
      if (profilesData) {
        profilesMap = Object.fromEntries(profilesData.map((p) => [p.id, p.name]));
      }
    }

    setRecentOrders(
      recent.map((o) => ({ ...o, customerName: profilesMap[o.user_id] || "" }))
    );

    setLoading(false);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "badge-warning",
      completed: "badge-success",
      cancelled: "badge-danger",
      processing: "badge-info",
    };
    return <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>;
  };

  const statCards = [
    {
      label: "Total Pesanan",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "#3b82f6",
      sub: `${stats.pendingOrders} pending`,
      to: "/orders",
    },
    {
      label: "Pendapatan",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "#D4AF37",
      sub: `${stats.completedOrders} selesai`,
      to: "/orders",
    },
    {
      label: "Pengguna",
      value: stats.totalUsers,
      icon: Users,
      color: "#22c55e",
      sub: "Terdaftar",
      to: "/users",
    },
    {
      label: "Produk",
      value: stats.totalProducts,
      icon: Package,
      color: "#a855f7",
      sub: `${stats.totalCategories} kategori`,
      to: "/products",
    },
    {
      label: "Ulasan",
      value: stats.totalReviews,
      icon: Star,
      color: "#f59e0b",
      sub: "Ulasan produk",
      to: "/reviews",
    },
    {
      label: "Testimoni",
      value: stats.totalTestimonials,
      icon: Quote,
      color: "#ec4899",
      sub: "Dari pelanggan",
      to: "/testimonials",
    },
    {
      label: "Artikel",
      value: stats.totalArticles,
      icon: FileText,
      color: "#06b6d4",
      sub: "Konten blog",
      to: "/articles",
    },
    {
      label: "Pesan Masuk",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "#ef4444",
      sub: stats.unreadMessages > 0 ? `${stats.unreadMessages} belum dibaca` : "Semua terbaca",
      to: "/messages",
    },
  ];

  if (loading)
    return (
      <Layout title="Dashboard">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse" />
          ))}
        </div>
      </Layout>
    );

  return (
    <Layout title="Dashboard" subtitle="Ringkasan aktivitas BrewByte">
      {/* Stat Cards */}
      <div className="stats-grid mb-6">
        {statCards.map((card, i) => (
          <Link key={i} to={card.to} className="card p-5 block hover:border-amber-400/30 transition-colors" style={{ textDecoration: "none" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider" style={{ color: "#6b6b60" }}>
                {card.label}
              </p>
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{ background: card.color + "15", border: `1px solid ${card.color}30` }}
              >
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "#EFEFE9" }}>
              {card.value}
            </p>
            <p className="text-xs" style={{ color: "#6b6b60" }}>
              {card.sub}
            </p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 lg:col-span-2">
          <h3 className="text-xs font-semibold mb-4 flex items-center gap-2" style={{ color: "#EFEFE9" }}>
            <TrendingUp size={14} style={{ color: "#D4AF37" }} /> Revenue 7 Hari Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b6b60" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#6b6b60" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
              <Tooltip
                contentStyle={{ background: "#1e1e1b", border: "1px solid #2a2a26", borderRadius: 0, fontSize: 11 }}
                labelStyle={{ color: "#EFEFE9" }}
                formatter={(v: number) => [formatPrice(v), "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#gold)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="text-xs font-semibold mb-4 flex items-center gap-2" style={{ color: "#EFEFE9" }}>
            <ShoppingCart size={14} style={{ color: "#3b82f6" }} /> Pesanan per Hari
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#6b6b60" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b6b60" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1e1e1b", border: "1px solid #2a2a26", borderRadius: 0, fontSize: 12 }}
                labelStyle={{ color: "#EFEFE9" }}
              />
              <Bar dataKey="orders" fill="#3b82f620" stroke="#3b82f6" strokeWidth={1} radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Kategori Produk", value: stats.totalCategories, icon: Tag, color: "#8b5cf6", to: "/categories" },
          { label: "Rating Ulasan", value: `${stats.totalReviews} review`, icon: Star, color: "#f59e0b", to: "/reviews" },
          { label: "Testimoni Aktif", value: stats.totalTestimonials, icon: Quote, color: "#ec4899", to: "/testimonials" },
          { label: "Pesan Belum Dibaca", value: stats.unreadMessages, icon: MessageSquare, color: stats.unreadMessages > 0 ? "#ef4444" : "#22c55e", to: "/messages" },
        ].map((card, i) => (
          <Link key={i} to={card.to} className="card p-4 block hover:border-amber-400/30 transition-colors" style={{ textDecoration: "none" }}>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                style={{ background: card.color + "15", border: `1px solid ${card.color}30` }}
              >
                <card.icon size={14} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "#EFEFE9" }}>{card.value}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "#6b6b60" }}>{card.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #2a2a26" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#EFEFE9" }}>
            Pesanan Terbaru
          </h3>
          <Link to="/orders" className="text-xs" style={{ color: "#D4AF37" }}>
            Lihat semua →
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Pelanggan</th>
                <th className="hide-mobile">Total</th>
                <th>Status</th>
                <th className="hide-mobile">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12" style={{ color: "#6b6b60" }}>
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ color: "#D4AF37", fontSize: 12 }}>{order.order_number}</td>
                    <td style={{ color: "#EFEFE9" }}>{order.customerName || "—"}</td>
                    <td className="hide-mobile">
                      <span style={{ fontSize: 12 }}>{formatPrice(order.total_price)}</span>
                    </td>
                    <td>{statusBadge(order.status)}</td>
                    <td className="hide-mobile" style={{ color: "#6b6b60", fontSize: 12 }}>
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
