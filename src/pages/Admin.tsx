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
            <path d="M2 3c0-1 1-2 3-2s3 1 3 2v14c-1-1-2-1.5-3-1.5S3 16 2 17V3z" />
            <path d="M8 3c0-1 1-2 3-2s3 1 3 2v14c-1-1-2-1.5-3-1.5S9 16 8 17V3z" />
          </svg>
        ),
      },
      {
        key: "products",
        label: "Products",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 1h10l2 4H2l2-4z" />
            <rect x="2" y="5" width="14" height="12" rx="1" />
            <path d="M7 5v3a2 2 0 004 0V5" />
          </svg>
        ),
      },
      {
        key: "prayers",
        label: "Prayer Requests",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 2C7 2 5 4 5 7c0 2 1 3 2 4l2 2 2-2c1-1 2-2 2-4 0-3-2-5-4-5z" />
            <path d="M6 13l-2 3M12 13l2 3" />
          </svg>
        ),
      },
      {
        key: "bibleplan",
        label: "Bible Plan",
        icon: (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 2h10c1 0 2 1 2 2v10l-3-2H4c-1 0-2-1-2-2V4c0-1 1-2 2-2z" />
            <path d="M6 6h6M6 9h4" />
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
            <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3 3l1.5 1.5M13.5 13.5L15 15M15 3l-1.5 1.5M4.5 13.5L3 15" />
          </svg>
        ),
      },
    ],
  },
];

const allNavItems = sidebarGroups.flatMap(g => g.items);

const Admin = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = useCallback((e: Event) => {
    setActiveSection((e as CustomEvent).detail);
  }, []);

  useEffect(() => {
    window.addEventListener('admin-navigate', handleNavigate);
    return () => window.removeEventListener('admin-navigate', handleNavigate);
  }, [handleNavigate]);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <AdminDashboard />;
      case "devotionals": return <AdminDevotionals />;
      case "products": return <AdminProducts />;
      case "prayers": return <AdminPrayers />;
      case "bibleplan": return <AdminBiblePlan />;
      case "users": return <AdminUsers />;
      case "settings": return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F0A04' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-white/[0.08] h-screen sticky top-0 overflow-y-auto" style={{ background: '#0A0703' }}>
        <div className="px-5 py-6 flex items-center gap-2">
          <span className="font-serif text-xl" style={{ color: '#C9A84C' }}>CrossAlliance</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ml-2 font-medium" style={{ background: '#C9A84C', color: '#0F0A04', fontFamily: 'Lato, sans-serif' }}>Admin</span>
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-0.5">
          {sidebarGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-200 w-full text-left relative ${
                    activeSection === item.key
                      ? 'bg-white/[0.06] text-white'
                      : 'text-[#7A6E62] hover:bg-white/[0.03] hover:text-white/80'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {activeSection === item.key && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r" style={{ background: '#C9A84C' }} />
                  )}
                  <span className={activeSection === item.key ? 'text-[#C9A84C]' : ''}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-4 pb-5 mt-auto">
          <div className="h-px w-full mb-4 bg-white/[0.06]" />
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0" style={{ background: '#C9A84C', color: '#0F0A04' }}>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-xs truncate" style={{ color: '#FDFAF5', fontFamily: 'Lato, sans-serif' }}>
                {user?.user_metadata?.full_name || 'Admin'}
              </div>
              <div className="text-[10px] truncate" style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs px-1 hover:text-white transition-colors duration-200"
            style={{ color: '#7A6E62', fontFamily: 'Lato, sans-serif' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 7H4M4 7l3 3M4 7l3-3" />
            </svg>
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] flex justify-around px-1 py-2" style={{ background: '#0A0703' }}>
        {allNavItems.slice(0, 5).map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-[10px] transition-colors ${
              activeSection === item.key ? 'text-[#C9A84C]' : 'text-[#7A6E62]'
            }`}
          >
            {item.icon}
            <span style={{ fontFamily: 'Lato, sans-serif' }}>{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-[10px] text-[#7A6E62]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="4" cy="9" r="1.5" /><circle cx="9" cy="9" r="1.5" /><circle cx="14" cy="9" r="1.5" />
          </svg>
          <span style={{ fontFamily: 'Lato, sans-serif' }}>More</span>
        </button>
      </div>

      {/* Mobile More Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 flex items-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-full p-4 pb-20 rounded-t-2xl border-t border-white/[0.08]" style={{ background: '#1A1209' }} onClick={(e) => e.stopPropagation()}>
            {allNavItems.slice(5).map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl w-full text-left text-sm mb-1 ${
                  activeSection === item.key ? 'bg-white/10 text-[#C9A84C]' : 'text-[#7A6E62]'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <Link to="/" className="flex items-center gap-2 text-xs text-[#7A6E62] px-5 py-3 mt-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 7H4M4 7l3 3M4 7l3-3" />
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
