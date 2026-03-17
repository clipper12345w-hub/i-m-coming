import { useState, useEffect } from "react";
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

const navItems: { key: Section; label: string; shortLabel: string; icon: JSX.Element }[] = [
  { key: "dashboard",   label: "Dashboard",   shortLabel: "Home",  icon: <LayoutDashboard size={20} /> },
  { key: "devotionals", label: "Devotionals", shortLabel: "Devo",  icon: <BookOpen size={20} /> },
  { key: "prayers",     label: "Prayers",     shortLabel: "Pray",  icon: <Heart size={20} /> },
  { key: "products",    label: "Products",    shortLabel: "Shop",  icon: <ShoppingBag size={20} /> },
  { key: "bibleplan",   label: "Bible Plan",  shortLabel: "Bible", icon: <Calendar size={20} /> },
  { key: "users",       label: "Users",       shortLabel: "Users", icon: <Users size={20} /> },
  { key: "settings",    label: "Settings",    shortLabel: "More",  icon: <Settings size={20} /> },
];

const bottomTabs = [
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[3],
  navItems[6],
];

export default function Admin() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/");
      return;
    }

    const checkRole = async () => {
      const { data, error } = await supabase.rpc("has_role", { _role: "admin" });
      if (error || !data) {
        navigate("/");
      } else {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, authLoading, navigate]);

  
  useEffect(() => {
  const handler = (e: Event) => {
    setActiveSection((e as CustomEvent).detail as Section);
  };
  window.addEventListener("admin-navigate", handler);
  return () => window.removeEventListener("admin-navigate", handler);
}, []);

  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":   return <AdminDashboard />;
      case "devotionals": return <AdminDevotionals />;
      case "prayers":     return <AdminPrayers />;
      case "products":    return <AdminProducts />;
      case "bibleplan":   return <AdminBiblePlan />;
      case "users":       return <AdminUsers />;
      case "settings":    return <AdminSettings />;
      default:            return <AdminDashboard />;
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gray-900 border-r border-gray-800 fixed left-0 top-0">
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-lg font-bold text-amber-400">CrossAlliance</span>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.key
                  ? "bg-amber-500 text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
          <span className="text-base font-bold text-amber-400">CrossAlliance Admin</span>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* MOBILE DRAWER */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <span className="font-semibold text-white">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key);
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.key
                      ? "bg-amber-500 text-gray-900"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="px-3 py-4 border-t border-gray-800">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-900 border-t border-gray-800 flex h-16">
        {bottomTabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
              activeSection === item.key
                ? "text-amber-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-none">{item.shortLabel}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}
