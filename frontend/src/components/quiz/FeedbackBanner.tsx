interface FeedbackBannerProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}

export default function FeedbackBanner({ isCorrect, correctAnswer, explanation }: FeedbackBannerProps) {
  return (
    <div className={`mt-4 p-4 rounded-xl border-l-4 ${
      isCorrect
        ? 'bg-green-50 border-green-500 text-green-800'
        : 'bg-red-50 border-red-500 text-red-800'
    }`}>
      <p className="font-bold mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
      {!isCorrect && (
        <p className="text-sm mb-1">
          Correct answer: <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
      <p className="text-sm">{explanation}</p>
    </div>
  );
}
