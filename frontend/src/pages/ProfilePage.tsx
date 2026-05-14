import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy' | 'billing'>('profile');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 items-start">
      <div className="space-y-4">
        <div className="bg-[#f1f3ff] rounded-[12px] p-6 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="w-20 h-20 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-2xl font-bold mx-auto">
            {initials}
          </div>
          <button className="text-[#004ac6] text-sm mt-2 hover:underline">Change photo</button>
          <h2 className="font-bold text-gray-900 text-xl mt-3">{user?.name ?? '—'}</h2>
          <p className="text-gray-500 text-sm">{user?.email ?? '—'}</p>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOTAL SCORE</p>
              <p className="text-xl font-bold text-[#004ac6] mt-1">—</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">COMPLETED</p>
              <p className="text-xl font-bold text-[#6a1edb] mt-1">—</p>
            </div>
          </div>
        </div>

        <div className="bg-[#f1f3ff] rounded-[12px] p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Account Overview</p>
          {[
            { id: 'profile', label: 'Profile Details', icon: User },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            { id: 'billing', label: 'Billing', icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as typeof activeSection)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all ${
                activeSection === id
                  ? 'bg-[#004ac6] text-white'
                  : 'text-gray-600 hover:bg-[#dce2f7]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#f1f3ff] rounded-[12px]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="p-6">
            <h2 className="font-bold text-gray-900 text-xl">Account Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your professional identity and login credentials.</p>
          </div>

          <div className="bg-[#dce2f7] h-px" />

          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-900 font-medium">{user?.email ?? '—'}</p>
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">VERIFIED</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-[8px] bg-white text-gray-700 text-sm font-medium hover:bg-[#dce2f7] transition-all">
              Update Email
            </button>
          </div>

          <div className="bg-[#dce2f7] h-px" />

          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PASSWORD</p>
              <p className="text-gray-500 text-sm mt-1">Last changed 4 months ago</p>
            </div>
            <button className="px-4 py-2 rounded-[8px] bg-white text-gray-700 text-sm font-medium hover:bg-[#dce2f7] transition-all">
              Change Password
            </button>
          </div>

          <div className="bg-[#dce2f7] h-px" />

          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">WEEKLY REPORTS</p>
              <p className="text-gray-500 text-sm mt-1">Receive a summary of your coding progress every Monday.</p>
            </div>
            <button
              onClick={() => setWeeklyReports(!weeklyReports)}
              className={`relative w-12 h-6 rounded-full transition-all ${weeklyReports ? 'bg-[#004ac6]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${weeklyReports ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        <div className="rounded-[12px] p-6 bg-red-50" style={{ boxShadow: '0 1px 3px rgba(239,68,68,0.12)' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-bold text-red-700">Danger Zone</h3>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-red-700">Delete Account</p>
              <p className="text-red-600/80 text-sm mt-1 max-w-md">
                Once you delete your account, there is no going back. Please be certain.
                All progress, certificates, and scores will be permanently erased.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                  alert('Account deletion is not yet implemented.');
                }
              }}
              className="ml-6 px-5 py-2.5 bg-red-700 text-white font-bold text-sm rounded-[8px] hover:bg-red-800 flex-shrink-0 uppercase tracking-wide"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
