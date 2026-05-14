import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, Lightbulb, Clock } from 'lucide-react';
import { submitAnswer, completeQuiz, type QuizQuestion, type AnswerFeedback } from '@/api/quizApi';
import AnswerOption from '@/components/quiz/AnswerOption';
import FeedbackBanner from '@/components/quiz/FeedbackBanner';
import { Spinner } from '@/components/ui/spinner';

type Phase = 'question' | 'feedback' | 'finishing';

interface LocationState {
  question: QuizQuestion;
  topicName: string;
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { attemptId } = useParams<{ attemptId: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [phase, setPhase] = useState<Phase>('question');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [topicName, setTopicName] = useState<string>('Quiz');
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state?.question) {
      setError('No quiz session found. Please start a quiz from the Topics page.');
      return;
    }
    setCurrentQuestion(state.question);
    setTopicName(state.topicName ?? 'Quiz');
  }, []);

  const accuracy = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  const canSubmit = currentQuestion?.questionType === 'FILL_BLANK'
    ? fillValue.trim().length > 0
    : selected !== null;

  const handleSubmit = async () => {
    if (!currentQuestion || !attemptId) return;
    const answer = currentQuestion.questionType === 'FILL_BLANK' ? fillValue.trim() : selected;
    if (!answer) return;

    setPhase('feedback');
    try {
      const fb = await submitAnswer(attemptId, currentQuestion.questionId, answer);
      setFeedback(fb);
      setAnsweredCount(prev => prev + 1);
      if (fb.isCorrect) setCorrectCount(prev => prev + 1);

      if (fb.isLastQuestion) {
        setTimeout(async () => {
          setPhase('finishing');
          try { await completeQuiz(attemptId); } catch { }
          navigate(`/quiz/${attemptId}/summary`);
        }, 2000);
      } else {
        setTimeout(() => {
          setCurrentQuestion(fb.nextQuestion);
          setSelected(null);
          setFillValue('');
          setFeedback(null);
          setPhase('question');
        }, 2000);
      }
    } catch {
      setError('Failed to submit answer. Please try again.');
      setPhase('question');
    }
  };

  const handleQuit = async () => {
    try { await completeQuiz(attemptId!); } catch { }
    navigate(`/quiz/${attemptId}/summary`);
  };

  if (error && !currentQuestion) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error}</p>
      <button onClick={() => navigate('/topics')} className="text-[#004ac6] hover:underline text-sm">
        ← Back to Topics
      </button>
    </div>
  );

  if (!currentQuestion || phase === 'finishing') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />
      <p className="text-gray-500">{phase === 'finishing' ? 'Saving your results…' : 'Loading quiz…'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header
        className="bg-white h-16 flex items-center px-6 justify-between"
        style={{ boxShadow: '0 1px 3px rgba(20,27,43,0.08)' }}
      >
        <button
          onClick={() => navigate('/topics')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="font-bold text-gray-900 text-sm">Quiz Session</p>
          <p className="text-xs text-gray-400">{topicName.toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#f1f3ff] text-[#6a1edb] text-xs font-bold px-3 py-1 rounded-full">
            Intermediate ↑
          </span>
          <button
            onClick={() => navigate('/topics')}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            SKIP
          </button>
          <button
            onClick={handleQuit}
            className="text-sm font-medium text-[#004ac6] hover:text-[#2563eb] ml-2"
          >
            QUIT
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PROGRESS</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-gray-900">
              Question {currentQuestion.position} of {currentQuestion.total}
            </p>
            <p className="text-sm text-gray-500">Accuracy: {accuracy}%</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[#dce2f7] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#004ac6] transition-all duration-500"
              style={{ width: `${(currentQuestion.position / currentQuestion.total) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => alert('AI hints coming soon!')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
            style={{ background: 'rgba(106,30,219,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <Lightbulb size={16} />
            Stuck? Ask the AI for a hint
          </button>
        </div>

        <div className="bg-white rounded-[12px] p-8" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {currentQuestion.questionType === 'MCQ' && (
            <span className="text-xs font-bold text-[#004ac6] bg-[#f1f3ff] px-3 py-1 rounded-full uppercase tracking-wider">
              Multiple Choice
            </span>
          )}
          <p className="text-2xl font-bold text-gray-900 mt-4 mb-6">
            {currentQuestion.questionText}
          </p>

          {currentQuestion.questionType !== 'FILL_BLANK' && (
            <div className="space-y-3">
              {currentQuestion.options.map(opt => (
                <AnswerOption
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  correct={feedback && opt === feedback.correctAnswer ? true : undefined}
                  incorrect={feedback && selected === opt && !feedback.isCorrect ? true : undefined}
                  disabled={!!feedback}
                  onClick={() => { if (!feedback) setSelected(opt); }}
                />
              ))}
            </div>
          )}

          {currentQuestion.questionType === 'FILL_BLANK' && (
            <input
              type="text"
              value={fillValue}
              onChange={e => setFillValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
              disabled={!!feedback}
              placeholder="Type your answer here…"
              className="w-full rounded-[8px] px-4 py-3 text-base focus:outline-none bg-[#f1f3ff] focus:bg-[#dce2f7] transition-colors"
            />
          )}
        </div>

        {feedback && (
          <FeedbackBanner
            isCorrect={feedback.isCorrect}
            correctAnswer={feedback.correctAnswer}
            explanation={feedback.explanation}
          />
        )}

        {!feedback && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span className="text-sm">Estimated time: 45 seconds</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-8 py-3 rounded-[8px] font-bold text-white transition-all ${
                canSubmit
                  ? 'hover:opacity-90 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
              style={canSubmit ? { background: 'linear-gradient(135deg, #004ac6, #2563eb)' } : { background: '#9ca3af' }}
            >
              Submit Answer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
