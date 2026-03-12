import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Reviews from "./pages/Reviews";
import Articles from "./pages/Articles";
import Messages from "./pages/Messages";
import Testimonials from "./pages/Testimonials";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0f0f0d" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "#D4AF37", borderTopColor: "transparent" }}
          />
          <p className="text-xs" style={{ color: "#6b6b60" }}>
            Memuat...
          </p>
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <Articles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/testimonials"
        element={
          <ProtectedRoute>
            <Testimonials />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1e1b",
              color: "#EFEFE9",
              border: "1px solid #2a2a26",
              borderRadius: 0,
              fontSize: 13,
            },
            success: {
              iconTheme: { primary: "#D4AF37", secondary: "#0f0f0d" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
