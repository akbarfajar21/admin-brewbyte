import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  MessageSquare,
  Tag,
  Coffee,
  LogOut,
  Star,
  ChevronRight,
  Quote,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/products", icon: Package, label: "Produk" },
  { to: "/categories", icon: Tag, label: "Kategori" },
  { to: "/orders", icon: ShoppingCart, label: "Pesanan" },
  { to: "/users", icon: Users, label: "Pengguna" },
  { to: "/reviews", icon: Star, label: "Ulasan" },
  { to: "/testimonials", icon: Quote, label: "Testimoni" },
  { to: "/articles", icon: FileText, label: "Artikel" },
  { to: "/messages", icon: MessageSquare, label: "Pesan" },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Berhasil keluar");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error("Gagal keluar");
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #2a2a26" }}
        >
          <div
            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
            style={{ background: "#D4AF37" }}
          >
            <Coffee size={15} style={{ color: "#0f0f0d" }} />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold block" style={{ color: "#EFEFE9" }}>
              Brew<span style={{ color: "#D4AF37" }}>Byte</span>
            </span>
            <p
              className="text-[9px] uppercase tracking-widest"
              style={{ color: "#6b6b60" }}
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <div className="px-3">
            <p
              className="text-[9px] uppercase tracking-[0.2em] px-3 mb-2 mt-1"
              style={{ color: "#6b6b60" }}
            >
              Menu Utama
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 mb-0.5 text-sm transition-all group rounded-sm ${
                    isActive
                      ? "text-amber-400 bg-amber-400/5"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/3"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 flex items-center justify-center transition-all rounded-sm ${
                          isActive ? "bg-amber-400/10" : "group-hover:bg-white/5"
                        }`}
                      >
                        <item.icon size={15} />
                      </div>
                      <span className="font-medium text-[13px]">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size={11} style={{ color: "#D4AF37" }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User */}
        <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid #2a2a26" }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0 rounded-sm"
              style={{ background: "#D4AF37", color: "#0f0f0d" }}
            >
              {(user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "#EFEFE9" }}
              >
                {user?.email?.split("@")[0]}
              </p>
              <p className="text-[10px]" style={{ color: "#D4AF37" }}>
                ADMIN
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors rounded-sm hover:bg-red-500/5"
            style={{ color: "#6b6b60" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b60")}
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
