import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticApi, type DiagnosticQuestion } from '@/api/diagnosticApi';
import FeedbackBanner from '@/components/quiz/FeedbackBanner';
import AnswerOption from '@/components/quiz/AnswerOption';
import { Spinner } from '@/components/ui/spinner';

type Phase = 'loading' | 'question' | 'feedback' | 'finishing';

interface Feedback {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export default function DiagnosticQuizPage() {
  const navigate = useNavigate();
  const [phase, setPhase]             = useState<Phase>('loading');
  const [attemptId, setAttemptId]     = useState<string | null>(null);
  const [question, setQuestion]       = useState<DiagnosticQuestion | null>(null);
  const [selected, setSelected]       = useState<string | null>(null);
  const [fillValue, setFillValue]     = useState('');
  const [feedback, setFeedback]       = useState<Feedback | null>(null);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    diagnosticApi.start()
      .then(res => {
        setAttemptId(res.data.attemptId);
        setQuestion(res.data);
        setPhase('question');
      })
      .catch((err) => {
        if (err?.response?.status === 400) {
          // Already completed — redirect to dashboard
          navigate('/dashboard');
        } else {
          setError('Failed to start diagnostic. Please refresh.');
        }
      });
  }, []);

  const handleSubmit = async () => {
    if (!question || !attemptId) return;
    const answer = question.questionType === 'FILL_BLANK' ? fillValue : selected;
    if (!answer) return;

    setPhase('feedback');
    try {
      const res = await diagnosticApi.submitAnswer(attemptId, question.questionId, answer);
      const data = res.data;
      setFeedback({ isCorrect: data.isCorrect, correctAnswer: data.correctAnswer, explanation: data.explanation });

      if (data.isLastQuestion) {
        setTimeout(async () => {
          setPhase('finishing');
          try {
            await diagnosticApi.complete(attemptId);
          } catch {
            // complete failed — still navigate to dashboard; progress was saved incrementally
          }
          navigate('/dashboard');
        }, 2000);
      } else {
        setTimeout(() => {
          setQuestion(data.nextQuestion);
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

  const handleSkip = async () => {
    try {
      await diagnosticApi.skip();
    } catch {
      // skip failed — navigate anyway; topics default to BEGINNER on first quiz
    }
    navigate('/dashboard');
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  if (phase === 'loading' || !question) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />
      <p className="text-gray-500">Preparing your diagnostic quiz…</p>
    </div>
  );

  if (phase === 'finishing') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner className="size-8" />
      <p className="text-gray-600 font-medium">Analysing your results…</p>
    </div>
  );

  const progress = (question.position / question.total) * 100;
  const isFillBlank = question.questionType === 'FILL_BLANK';
  const canSubmit = isFillBlank ? fillValue.trim().length > 0 : selected !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
        <span className="text-xl font-bold text-[#004ac6]">AdaptIQ</span>
        <span className="text-sm font-medium text-gray-600 hidden sm:block">
          Diagnostic Quiz — Setting up your profile
        </span>
        <button
          onClick={handleSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now
        </button>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div
          className="bg-[#004ac6] h-1.5 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-400 mt-2">
        Question {question.position} of {question.total}
      </p>

      {/* Question card */}
      <main className="max-w-2xl mx-auto px-4 mt-8 pb-16">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <p className="text-lg font-semibold text-gray-900 mb-6">
            {question.questionText}
          </p>

          {!isFillBlank && (
            <div className="space-y-3">
              {question.options.map(opt => (
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

          {isFillBlank && (
            <input
              type="text"
              value={fillValue}
              onChange={e => setFillValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canSubmit && handleSubmit()}
              disabled={!!feedback}
              placeholder="Type your answer here…"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#004ac6] transition-colors"
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
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
                canSubmit
                  ? 'bg-[#004ac6] hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {question.position === question.total ? 'Finish' : 'Next Question →'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
