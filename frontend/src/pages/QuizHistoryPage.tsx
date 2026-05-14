import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Download, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { getHistory, HistoryAttempt } from '@/api/progressApi';
import { Spinner } from '@/components/ui/spinner';

const PAGE_SIZE = 10;

const COLORS = ['#004ac6', '#6a1edb', '#059669', '#d97706', '#dc2626', '#0891b2'];

const topicColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

const scoreBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-700';
  if (score >= 60) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-600';
};

export default function QuizHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'7' | '30' | '90'>('30');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = history.filter(a => {
    const matchesTopic = topicFilter === 'all' || a.topicName === topicFilter;
    const daysDiff = (now.getTime() - new Date(a.completedAt).getTime()) / (1000 * 60 * 60 * 24);
    const matchesTime = daysDiff <= Number(timeFilter);
    return matchesTopic && matchesTime;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const uniqueTopics = [...new Set(history.map(a => a.topicName))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[3rem] font-bold text-gray-900 leading-none">Quiz History</h1>
        <p className="text-gray-500 mt-2">Review your past performance, track progress across different domains, and refine your learning path.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={topicFilter}
            onChange={e => { setTopicFilter(e.target.value); setPage(1); }}
            className="appearance-none bg-[#f1f3ff] rounded-[8px] px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <option value="all">Topic: All</option>
            {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={timeFilter}
            onChange={e => { setTimeFilter(e.target.value as '7' | '30' | '90'); setPage(1); }}
            className="appearance-none bg-[#f1f3ff] rounded-[8px] px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <option value="7">Time: Last 7 Days</option>
            <option value="30">Time: Last 30 Days</option>
            <option value="90">Time: Last 90 Days</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex-1" />

        <button
          onClick={() => alert('Export coming soon!')}
          className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#004ac6] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          <Download size={16} />
          Export Data
        </button>
      </div>

      <div className="bg-[#f1f3ff] rounded-[12px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="size-6" /></div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No quiz history yet.</p>
            <p className="text-sm mt-1">Take your first quiz to see your history here!</p>
            <button onClick={() => navigate('/topics')} className="mt-4 text-[#004ac6] text-sm hover:underline">Browse Topics →</button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-[#dce2f7]">
                  {['DATE & TIME', 'TOPIC', 'SCORE', 'DIFFICULTY RANGE', 'ACTIONS'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((attempt) => (
                  <tr key={attempt.attemptId} className="hover:bg-[#dce2f7]/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{format(new Date(attempt.completedAt), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-400">{format(new Date(attempt.completedAt), 'hh:mm aa')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: topicColor(attempt.topicName) }}
                        >
                          {attempt.topicName[0]}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{attempt.topicName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${scoreBadgeClass(attempt.score)}`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {attempt.difficultyStart && attempt.difficultyEnd ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 capitalize">{attempt.difficultyStart.toLowerCase()}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-[#dce2f7] w-24">
                            <div className="h-full rounded-full bg-[#004ac6]" style={{ width: '60%' }} />
                          </div>
                          <span className="text-xs font-medium text-[#004ac6] capitalize">{attempt.difficultyEnd.toLowerCase()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/quiz/${attempt.attemptId}/summary`)}
                        className="text-sm font-medium text-[#004ac6] hover:underline flex items-center gap-1"
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 flex items-center justify-between bg-white">
              <p className="text-sm text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} sessions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center text-gray-500 hover:bg-[#f1f3ff] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-[6px] text-sm font-medium transition-all ${
                      page === p ? 'bg-[#004ac6] text-white' : 'text-gray-600 hover:bg-[#f1f3ff]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center text-gray-500 hover:bg-[#f1f3ff] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 bg-[#f1f3ff] rounded-[12px] p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="font-bold text-gray-900 text-lg">Historical Velocity</h3>
          <p className="text-gray-500 text-sm mt-1">
            Your accuracy has increased by <span className="text-[#004ac6] font-bold">12%</span> in the last month while attempting increasingly difficult challenges.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-6">
            {[
              { value: '2.4h', label: 'AVG QUIZ TIME' },
              { value: history.length.toString(), label: 'SKILLS VALIDATED' },
              { value: 'A+', label: 'CURRENT GRADE' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-[#004ac6]">{value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-2 rounded-[12px] p-6 flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, #6a1edb, #8343f4)', boxShadow: '0 4px 16px rgba(106,30,219,0.25)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-white" />
              <p className="font-bold text-white">AI Recommendation</p>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Based on your recent performance, we've curated a deep-dive module to bridge the identified knowledge gaps.
            </p>
          </div>
          <button
            onClick={() => navigate('/topics')}
            className="mt-5 w-full py-2.5 rounded-[8px] font-bold text-[#6a1edb] bg-white text-sm hover:bg-white/90 transition-all"
          >
            Start Targeted Review
          </button>
        </div>
      </div>
    </div>
  );
}
