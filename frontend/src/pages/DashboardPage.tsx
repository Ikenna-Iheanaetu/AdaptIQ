import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, CheckCircle, Brain, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboard, type DashboardData } from '@/api/progressApi';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

const COLORS = ['#004ac6', '#6a1edb', '#059669', '#d97706', '#dc2626', '#0891b2'];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const profBadge = (level: string | null) => {
  if (level === 'ADVANCED') return { label: 'Advanced', cls: 'bg-[#004ac6] text-white' };
  if (level === 'INTERMEDIATE') return { label: 'Intermediate', cls: 'bg-[#6a1edb] text-white' };
  if (level === 'BEGINNER') return { label: 'Beginner', cls: 'bg-gray-400 text-white' };
  return { label: 'New', cls: 'bg-gray-200 text-gray-600' };
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    getDashboard()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const chartData = data.recentScores.map((s) => ({
    label: format(new Date(s.completedAt), 'MMM d'),
    score: s.score,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[2rem] font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Ready to sharpen your skills today?</p>
        </div>
        <div
          className="flex items-center gap-2 bg-[#f1f3ff] rounded-full px-4 py-2"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <Flame size={16} className="text-orange-500" />
          <span className="font-bold text-gray-900">{data.streakDays} days</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">STREAK</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-[#f1f3ff] rounded-[12px] p-5"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <div className="w-16 h-16 relative mx-auto mb-3">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#dce2f7" strokeWidth="8" />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#004ac6"
                strokeWidth="8"
                strokeDasharray={`${(data.averageScore / 100) * 163.4} 163.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-lg text-gray-900">
              {data.averageScore}%
            </span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
            OVERALL SCORE
          </p>
          <p className="text-xs text-green-600 text-center mt-1">+4% from last week</p>
        </div>

        <div
          className="bg-[#f1f3ff] rounded-[12px] p-5 flex flex-col items-center justify-center"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <CheckCircle size={28} className="text-gray-400 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{data.totalAttempts}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            QUIZZES COMPLETED
          </p>
        </div>

        <div
          className="bg-[#f1f3ff] rounded-[12px] p-5 relative"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <span className="absolute top-3 right-3 text-xs bg-[#6a1edb] text-white font-bold px-2 py-0.5 rounded-full">
            TOPSKILL
          </span>
          <Brain size={24} className="text-[#6a1edb] mb-2" />
          <p className="text-lg font-bold text-gray-900 mt-1">
            {data.strongestTopicName ?? '—'}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            STRONGEST TOPIC
          </p>
        </div>

        <div
          className="bg-[#f1f3ff] rounded-[12px] p-5 relative"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
            REVIEW NEEDED
          </span>
          <AlertTriangle size={24} className="text-red-500 mb-2" />
          <p className="text-lg font-bold text-gray-900 mt-1">
            {data.weakestTopicName ?? '—'}
          </p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            NEEDS ATTENTION
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div
          className="col-span-3 bg-[#f1f3ff] rounded-[12px] p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Score History</h3>
            <div className="flex gap-2">
              {(['weekly', 'monthly'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-1.5 rounded-[6px] text-sm font-medium transition-all capitalize ${
                    chartMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
              No quiz history yet. Take your first quiz!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  }}
                  cursor={{ fill: '#dce2f7' }}
                />
                <Bar dataKey="score" fill="#004ac6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div
          className="col-span-2 bg-[#f1f3ff] rounded-[12px] p-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <h3 className="font-bold text-gray-900 text-lg mb-4">Recommended for you</h3>
          <div className="space-y-3">
            {data.recommendations.slice(0, 2).map((rec, i) => (
              <div key={rec.id} className="bg-white rounded-[8px] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-[8px] flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {rec.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{rec.name}</p>
                    <p className="text-xs text-gray-400">15 mins • 20 Questions</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/topics/${rec.id}`)}
                  className="w-full py-2 rounded-[6px] text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
                >
                  Start Quiz →
                </button>
              </div>
            ))}
            {data.recommendations.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                Complete more quizzes for recommendations.
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className="bg-[#f1f3ff] rounded-[12px] overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
      >
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Your Topics</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-[#dce2f7]">
              {['TOPIC', 'PROFICIENCY', 'AVERAGE SCORE', 'LAST QUIZ'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.topicProgress.map((tp, i) => {
              const badge = profBadge(tp.proficiencyLevel);
              return (
                <tr
                  key={tp.topicId}
                  className="hover:bg-[#dce2f7]/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/topics/${tp.topicId}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      >
                        {tp.topicName[0]}
                      </div>
                      <span className="font-medium text-gray-900">{tp.topicName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-[#dce2f7] max-w-[120px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${tp.averageScore}%`,
                            background:
                              tp.averageScore >= 80
                                ? '#004ac6'
                                : tp.averageScore >= 60
                                  ? '#6a1edb'
                                  : '#9ca3af',
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {tp.averageScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {tp.lastQuizDate
                      ? format(new Date(tp.lastQuizDate + 'T00:00:00'), 'MMM d, yyyy')
                      : 'Never'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-6 py-4">
          <button
            onClick={() => navigate('/topics')}
            className="text-[#004ac6] text-sm font-medium hover:underline"
          >
            View All Topics →
          </button>
        </div>
      </div>
    </div>
  );
}
