import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';
import { Bell, Menu, X, User, LogOut, Calendar, Heart, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userApi.getNotifications().then((r) => r.data.data),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const unread = notifData?.unreadCount ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to ? 'text-rose-600' : 'text-stone-600 hover:text-charcoal-900'
      }`}
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </Link>
  );

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[4.25rem] items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles size={18} />
            </span>
            <div>
              <span className="font-display text-xl font-bold text-charcoal-900 group-hover:text-rose-600 transition-colors">
                Glamour Studio
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLink('/services', 'Services')}
            {navLink('/about', 'About')}
            {isAuthenticated && user?.role === 'customer' && (
              <>
                {navLink('/bookings', 'My Bookings')}
                {navLink('/wishlist', 'Wishlist')}
              </>
            )}
            {user?.role === 'admin' && navLink('/admin', 'Admin')}
            {user?.role === 'staff' && navLink('/staff', 'Schedule')}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!loading && isAuthenticated && user ? (
              <>
                <Link to="/notifications" className="relative p-2.5 rounded-full hover:bg-rose-50 text-stone-600 hover:text-rose-600 transition-colors">
                  <Bell size={20} />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-cream-200/60 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-rose-700" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-charcoal-800">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" aria-label="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : !loading ? (
              <>
                <Link to="/login" className="text-sm font-medium text-charcoal-700 hover:text-rose-600 px-4 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm !py-2.5 !px-5">Get Started</Link>
              </>
            ) : null}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-cream-200" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-5 pt-2 space-y-3 border-t border-cream-200">
            {navLink('/services', 'Services')}
            {navLink('/about', 'About')}
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link to="/bookings" className="flex items-center gap-2 py-2 text-stone-600" onClick={() => setMenuOpen(false)}>
                  <Calendar size={16} /> My Bookings
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 py-2 text-stone-600" onClick={() => setMenuOpen(false)}>
                  <Heart size={16} /> Wishlist
                </Link>
              </>
            )}
            {isAuthenticated && user ? (
              <>
                <Link to="/profile" className="block py-2 text-stone-600" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="block py-2 text-rose-600 font-medium">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary flex-1 text-center text-sm" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary flex-1 text-center text-sm" onClick={() => setMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
