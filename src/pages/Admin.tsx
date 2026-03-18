import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Heart,
  CalendarDays,
  Users,
  Settings,
  ArrowLeft,
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminDevotionals from "@/components/admin/AdminDevotionals";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminPrayers from "@/components/admin/AdminPrayers";
import AdminBiblePlan from "@/components/admin/AdminBiblePlan";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminSettings from "@/components/admin/AdminSettings";

const sidebarGroups = [
  {
    label: "MAIN",
    items: [
      { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { key: "devotionals", label: "Devotionals",     icon: <BookOpen     size={18} strokeWidth={1.5} /> },
      { key: "products",    label: "Products",        icon: <ShoppingBag  size={18} strokeWidth={1.5} /> },
      { key: "prayers",     label: "Prayer Requests", icon: <Heart        size={18} strokeWidth={1.5} /> },
      { key: "bibleplan",   label: "Bible Plan",      icon: <CalendarDays size={18} strokeWidth={1.5} /> },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { key: "users",    label: "Users",    icon: <Users    size={18} strokeWidth={1.5} /> },
      { key: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={1.5} /> },
    ],
  },
];

const allNavItems = sidebarGroups.flatMap((g) => g.items);

// 7 tabs — icon only, no label to fit cleanly
const bottomTabs = [
  { key: "dashboard",   label: "Home",    icon: <LayoutDashboard size={22} strokeWidth={1.5} /> },
  { key: "devotionals", label: "Devo",    icon: <BookOpen        size={22} strokeWidth={1.5} /> },
  { key: "products",    label: "Shop",    icon: <ShoppingBag     size={22} strokeWidth={1.5} /> },
  { key: "prayers",     label: "Prayer",  icon: <Heart           size={22} strokeWidth={1.5} /> },
  { key: "bibleplan",   label: "Bible",   icon: <CalendarDays    size={22} strokeWidth={1.5} /> },
  { key: "users",       label: "Users",   icon: <Users           size={22} strokeWidth={1.5} /> },
  { key: "settings",    label: "More",    icon: <Settings        size={22} strokeWidth={1.5} /> },
];

const Admin = () => {
  const { user, signInWithEmail, loading: authLoading, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  // Always require fresh login — never use remembered session
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Reset admin session state on mount without signing out
    setAdminAuthenticated(false);
  }, []);

  const handleNavigate = useCallback((e: Event) => {
    setActiveSection((e as CustomEvent).detail);
  }, []);

  useEffect(() => {
    window.addEventListener("admin-navigate", handleNavigate);
    return () => window.removeEventListener("admin-navigate", handleNavigate);
  }, [handleNavigate]);

  useEffect(() => {
    if (!user || !adminAuthenticated) { setRoleChecked(true); setHasRole(false); return; }
    const check = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "admin" as any)
        .maybeSingle();
      setHasRole(!error && !!data);
      setRoleChecked(true);
    };
    check();
  }, [user, adminAuthenticated]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setLoginError(error.message);
    } else {
      setAdminAuthenticated(true);
    }
    setLoginLoading(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":   return <AdminDashboard />;
      case "devotionals": return <AdminDevotionals />;
      case "products":    return <AdminProducts />;
      case "prayers":     return <AdminPrayers />;
      case "bibleplan":   return <AdminBiblePlan />;
      case "users":       return <AdminUsers />;
      case "settings":    return <AdminSettings />;
      default:            return <AdminDashboard />;
    }
  };

  // Loading
  if (authLoading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F0A04" }}>
        <div className="w-6 h-6 border-2 border-t-[#C9A84C] border-white/10 rounded-full animate-spin" />
      </div>
    );
  }

  // Login form
  if (!user || !hasRole || !adminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F0A04" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="font-serif text-2xl" style={{ color: "#C9A84C" }}>CrossAlliance</span>
            <p className="text-xs uppercase tracking-[0.2em] mt-2" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>Admin Access</p>
          </div>

          <form onSubmit={handleAdminLogin} className="rounded-2xl p-6 border" style={{ background: "#1A1209", borderColor: "rgba(255,255,255,0.08)" }}>
            <h2 className="font-serif text-xl mb-6 text-center" style={{ color: "#FDFAF5" }}>Sign In</h2>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg text-xs text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontFamily: "Lato, sans-serif" }}>
                {loginError}
              </div>
            )}
            {user && !hasRole && (
              <div className="mb-4 p-3 rounded-lg text-xs text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", fontFamily: "Lato, sans-serif" }}>
                This account does not have admin privileges.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#FDFAF5", fontFamily: "Lato, sans-serif" }}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#FDFAF5", fontFamily: "Lato, sans-serif" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-6 py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{ background: "#C9A84C", color: "#0F0A04", fontFamily: "Lato, sans-serif" }}
            >
              {loginLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen flex" style={{ background: "#0F0A04" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r h-screen sticky top-0 overflow-y-auto" style={{ background: "#0A0703", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="px-5 py-6 flex items-center gap-3">
          <span className="font-serif text-xl" style={{ color: "#C9A84C" }}>CrossAlliance</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-medium" style={{ background: "#C9A84C", color: "#0F0A04", fontFamily: "Lato, sans-serif" }}>Admin</span>
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-0.5">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 w-full text-left relative"
                  style={{ fontFamily: "Lato, sans-serif" }}
                >
                  {activeSection === item.key && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r" style={{ background: "#C9A84C" }} />
                  )}
                  <span style={{ color: activeSection === item.key ? "#C9A84C" : "#7A6E62" }}>{item.icon}</span>
                  <span style={{ color: activeSection === item.key ? "white" : "#7A6E62" }}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-5 mt-auto border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 pt-4 px-1 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "#C9A84C", color: "#0F0A04" }}>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <div className="text-xs truncate" style={{ color: "#FDFAF5", fontFamily: "Lato, sans-serif" }}>
                {user?.user_metadata?.full_name || "Admin"}
              </div>
              <div className="text-[10px] truncate" style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}>
                {user?.email || ""}
              </div>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs px-1 py-2 hover:opacity-80 transition-opacity"
            style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar — icon only, 7 tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08]" style={{ background: "#0A0703" }}>
        <div className="flex items-stretch h-14">
          {bottomTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
              style={{ color: activeSection === item.key ? "#C9A84C" : "#4A4035" }}
            >
              {item.icon}
              <span className="text-[9px] font-medium leading-none" style={{ fontFamily: "Lato, sans-serif" }}>{item.label}</span>
            </button>
          ))}
        </div>
        {/* Back to Site — di bawah tab bar, hanya mobile */}
        <div className="border-t border-white/[0.04] px-4 py-2 flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[10px] hover:opacity-80 transition-opacity"
            style={{ color: "#4A4035", fontFamily: "Lato, sans-serif" }}
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            Back to Site
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8">
        {renderSection()}
      </main>

    </div>
  );
};

export default Admin;
