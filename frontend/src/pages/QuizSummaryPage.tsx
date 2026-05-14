import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ChevronDown, TrendingUp, Lightbulb } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { getQuizSummary, type QuizSummaryData } from '@/api/quizApi';

const getRating = (score: number) => {
  if (score >= 85) return { label: 'Outstanding!', color: '#004ac6' };
  if (score >= 70) return { label: 'Good Job!', color: '#059669' };
  return { label: 'Keep Going!', color: '#d97706' };
};

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
};

function ScoreRing({ score }: { score: number }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#dce2f7" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke="#004ac6" strokeWidth="12"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="78" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1a1a2e">
        {score}%
      </text>
    </svg>
  );
}

export default function QuizSummaryPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QuizSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openQuestions, setOpenQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!attemptId) return;
    getQuizSummary(attemptId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [attemptId]);

  const toggleQuestion = (i: number) => {
    setOpenQuestions(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Could not load quiz results.</p>
    </div>
  );

  const rating = getRating(data.score);
  const errors = data.totalQuestions - data.correctAnswers;
  const errorPct = Math.round((errors / data.totalQuestions) * 100);
  const avgTime = data.totalQuestions > 0 ? Math.round(data.durationSeconds / data.totalQuestions) : 0;

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-16">
      {data.score >= 70 && (
        <div className="w-full py-3 px-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #8343f4, #6a1edb)' }}>
          <div className="flex items-center gap-2 text-white">
            <TrendingUp size={18} />
            <span className="font-medium text-sm">You've moved to Advanced!</span>
          </div>
          <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full">NEW ACHIEVEMENT</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="bg-white rounded-[12px] p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center gap-3">
              <ScoreRing score={data.score} />
              <p className="text-2xl font-bold" style={{ color: rating.color }}>{rating.label}</p>
              <p className="text-gray-500 text-sm text-center">You've completed the quiz. Review your answers below.</p>
            </div>
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
                {[
                  { label: 'CORRECT', value: `${data.correctAnswers} / ${data.totalQuestions}`, icon: <CheckCircle size={18} className="text-[#004ac6]" /> },
                  { label: 'ACCURACY', value: `${data.score}%`, bold: true, color: '#004ac6' },
                  { label: 'INCORRECT', value: `${errors} / ${data.totalQuestions}`, icon: <XCircle size={18} className="text-red-500" /> },
                  { label: 'ERRORS', value: `${errorPct}%`, bold: true, color: '#ef4444' },
                  { label: 'DURATION', value: formatDuration(data.durationSeconds), icon: <Clock size={18} className="text-gray-400" /> },
                  { label: 'AVG TIME', value: `${avgTime}s`, bold: true, color: '#374151' },
                ].map(({ label, value, icon, bold, color }) => (
                  <div key={label} className="flex items-start gap-2">
                    {icon && <div className="mt-0.5">{icon}</div>}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xl font-bold mt-0.5" style={{ color: color ?? '#374151' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/topics')}
                  className="w-full py-3 rounded-[8px] font-bold text-white text-sm hover:opacity-90 transition-all"
                  style={{ background: 'linear-gradient(135deg, #004ac6, #2563eb)' }}
                >
                  Explore Topics →
                </button>
                <button
                  onClick={() => navigate('/topics')}
                  className="w-full py-3 rounded-[8px] font-bold text-gray-700 text-sm bg-[#f1f3ff] hover:bg-[#dce2f7] transition-all"
                >
                  Retake quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[12px] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <div className="px-8 py-5 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-xl">Question Review</h2>
            <span className="text-sm text-gray-400">Review your answers and insights</span>
          </div>
          <div className="bg-[#dce2f7] h-px" />
          {data.questions.map((q, i) => (
            <div key={i}>
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full px-8 py-4 flex items-center gap-4 hover:bg-[#f9f9ff] transition-colors text-left"
              >
                {q.isCorrect
                  ? <CheckCircle size={20} className="text-[#004ac6] flex-shrink-0" />
                  : <XCircle size={20} className="text-red-500 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">QUESTION {String(i + 1).padStart(2, '0')}</p>
                  <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{q.questionText}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${openQuestions.has(i) ? 'rotate-180' : ''}`} />
              </button>

              {openQuestions.has(i) && !q.isCorrect && (
                <div className="px-8 pb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-[8px] p-4 bg-red-50">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">YOUR ANSWER</p>
                    <p className="text-sm text-red-700 font-medium">{q.learnerAnswer || '(no answer)'}</p>
                  </div>
                  <div className="rounded-[8px] p-4 bg-green-50">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">CORRECT ANSWER</p>
                    <p className="text-sm text-green-700 font-medium">{q.correctAnswer}</p>
                  </div>
                  {q.explanation && (
                    <div className="col-span-2 rounded-[8px] p-4 bg-[#f1f3ff]">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-[#6a1edb]" />
                        <p className="text-xs font-bold text-[#6a1edb] uppercase tracking-wider">AI Insight</p>
                      </div>
                      <p className="text-sm text-gray-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
              <div className="bg-[#dce2f7] h-px mx-8" />
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-bold text-gray-900 text-xl mb-4">Next for You</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'MASTERY PATH', title: 'Advanced Concepts', icon: '✦' },
              { type: 'WORKSHOP', title: 'Practice Session', icon: '✎' },
              { type: 'PROJECT', title: 'Build Something', icon: '◈' },
            ].map(({ type, title, icon }) => (
              <div key={type} className="bg-[#f1f3ff] rounded-[12px] p-6 relative overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{type}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">{title}</p>
                <span className="absolute bottom-4 right-4 text-5xl text-gray-200 font-bold select-none">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
