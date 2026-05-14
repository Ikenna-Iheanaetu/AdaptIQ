import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    const onMouseDown = ({ target }: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [dropdownOpen]);

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f9ff' }}>
      <nav
        className="h-16 px-6 flex items-center w-full"
        style={{ backgroundColor: '#004ac6' }}
      >
        <span className="font-bold text-white" style={{ fontSize: '1.25rem' }}>
          AdaptIQ
        </span>

        <div className="flex items-center gap-8 ml-8">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'text-white opacity-100 border-b-2 border-white pb-1 text-sm font-medium'
                : 'text-white opacity-80 text-sm font-medium hover:opacity-100 transition-opacity'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/topics"
            className={({ isActive }) =>
              isActive
                ? 'text-white opacity-100 border-b-2 border-white pb-1 text-sm font-medium'
                : 'text-white opacity-80 text-sm font-medium hover:opacity-100 transition-opacity'
            }
          >
            Topics
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? 'text-white opacity-100 border-b-2 border-white pb-1 text-sm font-medium'
                : 'text-white opacity-80 text-sm font-medium hover:opacity-100 transition-opacity'
            }
          >
            History
          </NavLink>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <Bell size={20} className="text-white opacity-80" />

          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center justify-center rounded-full text-white font-semibold text-sm focus:outline-none"
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#2563eb',
              }}
            >
              {firstLetter}
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white rounded-[8px]"
                style={{
                  top: '100%',
                  boxShadow: '0 4px 16px rgba(20, 27, 43, 0.12)',
                }}
              >
                <button
                  onClick={handleProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f1f3ff] cursor-pointer rounded-t-[8px]"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f1f3ff] cursor-pointer rounded-b-[8px]"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
