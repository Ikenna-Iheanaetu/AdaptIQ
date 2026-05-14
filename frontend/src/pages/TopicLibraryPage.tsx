import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import { getTopics, type TopicItem } from '@/api/topicsApi';
import { Spinner } from '@/components/ui/spinner';

interface TopicProgressItem {
  topicId: string;
  topicName: string;
  topicDescription: string;
  proficiencyLevel: string | null;
  averageScore: number;
  attempts: number;
  lastQuizDate: string | null;
}

const ICON_COLORS = ['#004ac6', '#6a1edb', '#059669', '#d97706', '#dc2626', '#0891b2'];
const iconColor = (index: number) => ICON_COLORS[index % ICON_COLORS.length];

const proficiencyColor = (level: string | null) => {
  if (level === 'ADVANCED') return 'bg-[#004ac6] text-white';
  if (level === 'INTERMEDIATE') return 'bg-[#6a1edb] text-white';
  if (level === 'BEGINNER') return 'bg-gray-400 text-white';
  return 'bg-gray-200 text-gray-600';
};

const proficiencyLabel = (level: string | null) => level ?? 'New';

export default function TopicLibraryPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [progress, setProgress] = useState<TopicProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      getTopics(),
      axiosInstance.get<TopicProgressItem[]>('/progress/topics').then((r) => r.data),
    ])
      .then(([topicsData, progressData]) => {
        setTopics(topicsData);
        setProgress(progressData);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Spinner className="size-8" />
        <p className="text-gray-500">Loading topics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[3rem] font-bold text-gray-900 leading-none">Topics</h1>
          <p className="text-gray-500 mt-2">Choose your path and continue your mastery journey.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search topics, skills, or frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-[8px] bg-[#f1f3ff] text-sm outline-none w-72 placeholder:text-gray-400 focus:ring-2 focus:ring-[#004ac6]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic, i) => {
          const prog = progress.find((p) => p.topicId === topic.id);
          const score = prog?.averageScore ?? 0;
          return (
            <div
              key={topic.id}
              className="bg-[#f1f3ff] rounded-[12px] p-6 relative"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
            >
              <span
                className={`absolute top-4 right-4 text-xs font-medium px-3 py-1 rounded-full ${proficiencyColor(prog?.proficiencyLevel ?? null)}`}
              >
                {proficiencyLabel(prog?.proficiencyLevel ?? null)}
              </span>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                style={{ backgroundColor: iconColor(i) }}
              >
                {topic.name[0]}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{topic.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{topic.description}</p>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#dce2f7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#004ac6] transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate(`/topics/${topic.id}`)}
                className={`mt-4 w-full py-2.5 rounded-[8px] font-semibold text-sm transition-all ${
                  score > 0
                    ? 'bg-[#004ac6] text-white hover:bg-[#2563eb]'
                    : 'bg-white text-gray-700 hover:bg-[#dce2f7]'
                }`}
                style={score > 0 ? { background: 'linear-gradient(135deg, #004ac6, #2563eb)' } : {}}
              >
                Start Quiz
              </button>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-[12px] p-6 flex items-center gap-6"
        style={{ background: 'linear-gradient(135deg, #6a1edb, #8343f4)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Brain className="text-white" size={28} />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">AI Relevance</span>
          <h3 className="text-white font-bold text-lg mt-1">Ready for a challenge?</h3>
          <p className="text-white/80 text-sm mt-1">
            Based on your recent progress, we recommend advancing to the next level.
          </p>
        </div>
        <button className="bg-gray-900 text-white px-5 py-2.5 rounded-[8px] font-semibold text-sm hover:bg-gray-800 flex-shrink-0">
          View Recommendation
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL TOPICS', value: topics.length },
          { label: 'MASTERED', value: progress.filter((p) => (p.averageScore ?? 0) >= 80).length },
          { label: 'LEARNING TIME', value: '—' },
          { label: 'GLOBAL RANK', value: '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#f1f3ff] rounded-[12px] p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
