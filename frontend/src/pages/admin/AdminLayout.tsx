import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Scissors, Users, Calendar, UserCheck,
  Tag, MessageSquare, Settings, BarChart3, LogOut, Sparkles,
} from 'lucide-react';

const NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/services', icon: Scissors, label: 'Services' },
  { to: '/admin/staff', icon: Users, label: 'Staff' },
  { to: '/admin/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/admin/customers', icon: UserCheck, label: 'Customers' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-cream-100">
      <aside className="w-64 bg-charcoal-900 text-cream-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-charcoal-700">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold text-white">Admin</h1>
              <p className="text-xs text-cream-300/60">Glamour Studio</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-rose-600 text-white shadow-glow'
                    : 'text-cream-300/80 hover:bg-charcoal-800 hover:text-white'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-7 py-4 text-cream-300/60 hover:text-rose-300 border-t border-charcoal-700 transition-colors"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
