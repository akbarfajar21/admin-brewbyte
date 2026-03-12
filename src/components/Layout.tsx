import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Layout({
  children,
  title,
  subtitle,
  actions,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f0d" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content min-h-screen flex flex-col">
        {/* Topbar */}
        <div className="topbar">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger – visible on mobile only */}
            <button
              className="hamburger topbar-hamburger flex-shrink-0"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>

            <div className="min-w-0">
              {title && (
                <h1
                  className="text-base md:text-lg font-bold truncate"
                  style={{ color: "#EFEFE9" }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  className="text-xs hidden sm:block"
                  style={{ color: "#6b6b60" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="page-content flex-1 animate-in">{children}</main>
      </div>
    </div>
  );
}
