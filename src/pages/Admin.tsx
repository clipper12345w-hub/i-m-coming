import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
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
      {
        key: "dashboard",
        label: "Dashboard",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="7" height="7" rx="1" />
            <rect x="10" y="1" width="7" height="7" rx="1" />
            <rect x="1" y="10" width="7" height="7" rx="1" />
            <rect x="10" y="10" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "CONTENT",
    items: [
      {
        key: "devotionals",
        label: "Devotionals",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3c0-1 1-2 3-2s4 1 4 2v14c-1-1-3-2-4-2s-2 0-3 1V3z" />
            <path d="M8 3c0-1 1-2 3-2s4 1 4 2v14c-1-1-3-2-4-2s-2 0-3 1V3z" />
          </svg>
        ),
      },
      {
        key: "products",
        label: "Products",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 1h10l3 4H1l3-4z" />
            <rect x="2" y="5" width="14" height="12" rx="1" />
            <path d="M7 5v4a2 2 0 004 0V5" />
          </svg>
        ),
      },
      {
        key: "prayers",
        label: "Prayer Requests",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 2C7 2 5 4 5 7c0 2 1 4 2 5l2 2 2-2c1-1 2-3 2-5 0-3-2-5-4-5z" />
            <path d="M6 13l-2 3M12 13l2 3" />
          </svg>
        ),
      },
      {
        key: "bibleplan",
        label: "Bible Plan",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="14" height="14" rx="1" />
            <path d="M2 7h14M6 1v4M12 1v4" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        key: "users",
        label: "Users",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="6" r="3" />
            <path d="M3 16c0-3 3-5 6-5s6 2 6 5" />
          </svg>
        ),
      },
      {
        key: "settings",
        label: "Settings",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="3" />
            <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3 3l1.5 1.5M13.5 13.5L15 15M3 15l1.5-1.5M13.5 4.5L15 3" />
          </svg>
        ),
      },
    ],
  },
];

const allNavItems = sidebarGroups.flatMap((g) => g.items);

const Admin = () => {
  const { user, signInWithEmail, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  const handleNavigate = useCallback((e: Event) => {
    setActiveSection((e as CustomEvent).detail);
  }, []);

  useEffect(() => {
    window.addEventListener("admin-navigate", handleNavigate);
    return () => window.removeEventListener("admin-navigate", handleNavigate);
  }, [handleNavigate]);

  useEffect(() => {
    if (!user) { setRoleChecked(true); setHasRole(false); return; }
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
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) setLoginError(error.message);
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

  // Login form (not logged in OR logged in but no admin role)
  if (!user || !hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F0A04" }}>
        <div className="w-full max-w-sm mx-4">
          <div className="text-center mb-8">
            <span className="font-serif text-2xl" style={{ color: "#C9A84C" }}>CrossAlliance</span>
            <p className="font-sans text-xs uppercase tracking-[0.2em] mt-2" style={{ color: "#7A6E62" }}>Admin Access</p>
          </div>

          <form onSubmit={handleAdminLogin} className="rounded-2xl p-6 sm:p-8 border" style={{ background: "#1A1209", border: "1px solid rgba(255,255,255,0.08)" }}>
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
        <div className="px-5 py-6 flex items-center gap-2">
          <span className="font-serif text-xl" style={{ color: "#C9A84C" }}>CrossAlliance</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ml-2 font-medium" style={{ background: "#C9A84C", color: "#0F0A04", fontFamily: "Lato, sans-serif" }}>Admin</span>
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
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-200 w-full text-left relative"
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

        <div className="px-4 pb-5 mt-auto">
          <div className="h-px w-full mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: "#C9A84C", color: "#0F0A04" }}>
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
            className="flex items-center gap-2 text-xs px-1 py-3 mt-2 hover:text-white transition-colors duration-200"
            style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 7H4M4 7l3-3M4 7l3 3" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] flex justify-around px-1 py-2" style={{ background: "#0A0703" }}>
        {allNavItems.slice(0, 5).map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-[10px] transition-colors"
            style={{ color: activeSection === item.key ? "#C9A84C" : "#7A6E62" }}
          >
            {item.icon}
            <span style={{ fontFamily: "Lato, sans-serif" }}>{item.label.split(" ")[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-[10px] text-[#7A6E62]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="4" cy="9" r="1.5" /><circle cx="9" cy="9" r="1.5" /><circle cx="14" cy="9" r="1.5" />
          </svg>
          <span style={{ fontFamily: "Lato, sans-serif" }}>More</span>
        </button>
      </div>

      {/* Mobile More Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 flex items-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-full p-4 pb-20 rounded-t-2xl border-t border-white/[0.08]" style={{ background: "#1A1209" }} onClick={(e) => e.stopPropagation()}>
            {allNavItems.slice(5).map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl w-full text-left text-sm mb-1"
                style={{ background: activeSection === item.key ? "rgba(255,255,255,0.10)" : "transparent", color: activeSection === item.key ? "#C9A84C" : "#7A6E62", fontFamily: "Lato, sans-serif" }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <Link
              to="/"
              className="flex items-center gap-2 text-xs px-5 py-3 mt-2"
              style={{ color: "#7A6E62", fontFamily: "Lato, sans-serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 7H4M4 7l3-3M4 7l3 3" />
              </svg>
              Back to Site
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {renderSection()}
      </main>

    </div>
  );
};

export default Admin;
