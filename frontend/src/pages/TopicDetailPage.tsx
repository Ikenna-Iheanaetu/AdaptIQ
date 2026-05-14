import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Sparkles, Share2, Bookmark, Settings } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import axiosInstance from '@/api/axiosInstance';
import { getTopicDetail, type TopicDetailItem, type RecentAttempt } from '@/api/topicsApi';
import { Spinner } from '@/components/ui/spinner';

interface StartQuizResponse {
  questionId: string;
  attemptId: string;
  position: number;
  total: number;
  questionText: string;
  questionType: string;
  options: string[];
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#dce2f7" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke="#004ac6" strokeWidth="10"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1a1a2e">
        {score}%
      </text>
    </svg>
  );
}

const profBadge = (score: number, attempts: number) => {
  if (attempts === 0) return { label: 'New', className: 'bg-gray-200 text-gray-600' };
  if (score >= 80) return { label: 'Advanced', className: 'bg-[#004ac6] text-white' };
  if (score >= 60) return { label: 'Intermediate', className: 'bg-[#6a1edb] text-white' };
  return { label: 'Beginner', className: 'bg-gray-400 text-white' };
};

export default function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<TopicDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(10);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!topicId) {
      setError('Topic not found.');
      setLoading(false);
      return;
    }
    getTopicDetail(topicId)
      .then((data) => {
        setTopic(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load topic. Please try again.');
        setLoading(false);
      });
  }, [topicId]);

  const handleStartQuiz = async () => {
    if (!topic) return;
    setStarting(true);
    try {
      const res = await axiosInstance.post<StartQuizResponse>('/quiz/start', {
        topicId: topic.id,
        questionCount: selectedCount,
      });
      const question = res.data;
      navigate(`/quiz/${question.attemptId}`, {
        state: { question, topicName: topic.name },
      });
    } catch {
      setError('Failed to start quiz. Please try again.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-medium">{error ?? 'Topic not found.'}</p>
        <Link
          to="/topics"
          className="px-5 py-2 rounded-[8px] text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
        >
          Back to Topics
        </Link>
      </div>
    );
  }

  const badge = profBadge(topic.averageScore, topic.quizzesTaken);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/topics" className="hover:text-[#004ac6]">Topics</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{topic.name}</span>
      </nav>

      <div className="grid grid-cols-5 gap-6">
        <div
          className="col-span-3 bg-[#f1f3ff] rounded-[12px] p-8 space-y-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-start gap-6">
            <ScoreRing score={topic.averageScore} />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{topic.name}</h1>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{topic.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'QUIZZES TAKEN', value: topic.quizzesTaken, colored: false },
              { label: 'BEST SCORE', value: `${topic.bestScore}%`, colored: true },
              {
                label: 'LAST QUIZ',
                value: topic.lastQuizDate
                  ? formatDistanceToNow(new Date(topic.lastQuizDate + 'T00:00:00'), { addSuffix: true })
                  : 'Never',
                colored: false,
              },
            ].map(({ label, value, colored }) => (
              <div key={label}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-bold mt-1 ${colored ? 'text-[#004ac6]' : 'text-gray-900'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Performance History</h3>
              <span className="text-xs text-gray-400">Your recent progression in this module.</span>
            </div>

            {topic.recentAttempts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No quizzes taken yet</p>
            ) : (
              <div className="space-y-0">
                <div className="grid grid-cols-3 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider pb-2">
                  <span>DATE</span>
                  <span>ITEMS</span>
                  <span>PERFORMANCE</span>
                </div>
                {topic.recentAttempts.slice(0, 5).map((a: RecentAttempt) => (
                  <div key={a.attemptId} className="grid grid-cols-3 gap-4 items-center py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(a.completedAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-sm text-gray-500">{a.totalQuestions} Questions</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-[#dce2f7]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${a.score}%`,
                            background: a.score >= 80 ? '#004ac6' : a.score >= 60 ? '#6a1edb' : '#ef4444',
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                        {a.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <div
            className="bg-[#f1f3ff] rounded-[12px] p-6 sticky top-6"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <h3 className="font-bold text-gray-900 text-lg">Start Session</h3>
            <p className="text-gray-500 text-sm mt-1">Configure your practice parameters.</p>

            <div className="mt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                QUESTION COUNT
              </p>
              <div className="flex gap-3">
                {[10, 15, 20].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedCount(n)}
                    className={`flex-1 py-2.5 rounded-[8px] font-semibold text-sm transition-all ${
                      selectedCount === n
                        ? 'bg-white text-[#004ac6] ring-2 ring-[#004ac6]'
                        : 'bg-white text-gray-600 hover:bg-[#dce2f7]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-[8px] bg-white p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f1f3ff] flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-[#6a1edb]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Adaptive Focus</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  We'll prioritize topics based on your past errors.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={starting}
              className="mt-5 w-full py-3 rounded-[8px] font-bold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
            >
              {starting ? 'Starting…' : 'Start Quiz →'}
            </button>

            <div className="flex justify-center gap-6 mt-4">
              {[Share2, Bookmark, Settings].map((Icon, i) => (
                <button key={i} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
