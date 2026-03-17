import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Heart,
  ShoppingBag,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminDevotionals from "@/components/admin/AdminDevotionals";
import AdminPrayers from "@/components/admin/AdminPrayers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminBiblePlan from "@/components/admin/AdminBiblePlan";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSettings from "@/components/admin/AdminSettings";

type Section =
  | "dashboard"
  | "devotionals"
  | "prayers"
  | "products"
  | "bibleplan"
  | "users"
  | "settings";

const navItems: {
  key: Section;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: "devotionals",
    label: "Devotionals",
    shortLabel: "Devo",
    icon: <BookOpen size={20} />,
  },
  {
    key: "prayers",
    label: "Prayers",
    shortLabel: "Pray",
    icon: <Heart size={20} />,
  },
  {
    key: "products",
    label: "Products",
    shortLabel: "Shop",
    icon: <ShoppingBag size={20} />,
  },
  {
    key: "bibleplan",
    label: "Bible Plan",
    shortLabel: "Bible",
    icon: <Calendar size={20} />,
  },
  {
    key: "users",
    label: "Users",
    shortLabel: "Users",
    icon: <Users size={20} />,
  },
  {
    key: "settings",
    label: "Settings",
    shortLabel: "More",
    icon: <Settings size={20} />,
  },
];

// Bottom tab shows only 5 items on mobile
const bottomTabItems = navItems.slice(0, 4).concat(navItems[6]);

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "admin" as any)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate("/");
        } else {
          setIsAdmin(true);
        }
        setLoading(false);
      });
  }, [user, navigate]);

  useEffect(() => {
    const handler = (e: Event) => {
      const section = (e as CustomEvent).detail as Section;
      setActiveSection(section);
    };
    window.addEventListener("admin-navigate", handler);
    return () => window.removeEventListener("admin-navigate", handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0F0A04" }}
      >
        <div
          className="w-6 h-6 border-2 rounded-full animate-spin"
          style={{
            borderColor: "rgba(201,168,76,0.2)",
            borderTopColor: "#C9A84C",
          }}
        />
      </div>
    );
  }

  if (!isAdmin) return null;

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <AdminDashboard />;
      case "devotionals":
        return <AdminDevotionals />;
      case "prayers":
        return <AdminPrayers />;
      case "products":
        return <AdminProducts />;
      case "bibleplan":
        return <AdminBiblePlan />;
      case "users":
        return <AdminUsers />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0F0A04", fontFamily: "Lato, sans-serif" }}
    >
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40"
        style={{
          width: 240,
          background: "#0F0A04",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-6 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <span
            className="text-sm uppercase tracking-widest"
            style={{ color: "#C9A84C" }}
          >
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-colors duration-150"
                style={{
                  background: active
                    ? "rgba(201,168,76,0.1)"
                    : "transparent",
                  borderLeft: active
                    ? "2px solid #C9A84C"
                    : "2px solid transparent",
                  color: active ? "#C9A84C" : "#7A6E62",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.color = "#FDFAF5";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.color = "#7A6E62";
                }}
              >
                <span
                  style={{ color: active ? "#C9A84C" : "inherit" }}
                >
                  {item.icon}
                </span>
                <span className="text-sm" style={{ letterSpacing: "0.02em" }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150"
            style={{ color: "#7A6E62" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.background = "rgba(239,68,68,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#7A6E62";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: "#0F0A04",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <svg width="8" height="12" viewBox="0 0 10 14" fill="none">
            <path d="M5 0V14M1 4H9" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "#C9A84C" }}
          >
            Admin
          </span>
        </div>

        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: "#7A6E62" }}
        >
          {navItems.find((n) => n.key === activeSection)?.label}
        </span>

        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{ color: "#7A6E62" }}
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ── MOBILE DRAWER (full menu) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="relative flex flex-col w-64 h-full ml-auto"
            style={{ background: "#0F0A04" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-xs uppercase tracking-widest"
                style={{ color: "#C9A84C" }}
              >
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#7A6E62" }}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {navItems.map((item) => {
                const active = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveSection(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-left transition-colors duration-150"
                    style={{
                      background: active
                        ? "rgba(201,168,76,0.1)"
                        : "transparent",
                      borderLeft: active
                        ? "2px solid #C9A84C"
                        : "2px solid transparent",
                      color: active ? "#C9A84C" : "#7A6E62",
                    }}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div
              className="px-3 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150"
                style={{ color: "#7A6E62" }}
              >
                <LogOut size={18} />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main
        className="flex-1 min-h-screen"
        style={{
          marginLeft: 0,
          paddingTop: "3.5rem", // mobile header height
          paddingBottom: "4.5rem", // mobile bottom tab height
        }}
      >
        {/* Desktop: offset for sidebar */}
        <style>{`
          @media (min-width: 768px) {
            .admin-main {
              margin-left: 240px !important;
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }
          }
        `}</style>
        <div className="admin-main p-4 md:p-6 lg:p-8" style={{ minHeight: "100vh" }}>
          {renderContent()}
        </div>
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "#0F0A04",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          height: 64,
        }}
      >
        <div className="flex items-center justify-around h-full px-2">
          {bottomTabItems.map((item) => {
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className="flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors duration-150"
                style={{
                  minWidth: 56,
                  height: 52,
                  color: active ? "#C9A84C" : "#4A4035",
                  padding: "4px 8px",
                }}
              >
                {item.icon}
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontFamily: "Lato, sans-serif",
                    fontWeight: active ? 700 : 400,
                    lineHeight: 1,
                  }}
                >
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
                  }
