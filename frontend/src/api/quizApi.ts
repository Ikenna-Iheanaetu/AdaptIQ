import axiosInstance from './axiosInstance';

export interface QuizQuestion {
  questionId: string;
  attemptId: string;
  position: number;
  total: number;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK';
  options: string[];
}

export interface AnswerFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  currentPosition: number;
  total: number;
  isLastQuestion: boolean;
  nextQuestion: QuizQuestion | null;
}

export interface QuizComplete {
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface QuizSummaryQuestion {
  questionText: string;
  questionType: string;
  options: string[];
  learnerAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSummaryData {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  questions: QuizSummaryQuestion[];
}

export const startQuiz = (topicId: string, questionCount: number): Promise<QuizQuestion> =>
  axiosInstance.post<QuizQuestion>('/quiz/start', { topicId, questionCount }).then((r) => r.data);

export const submitAnswer = (attemptId: string, questionId: string, answer: string): Promise<AnswerFeedback> =>
  axiosInstance.post<AnswerFeedback>(`/quiz/${attemptId}/answer`, { questionId, answer }).then((r) => r.data);

export const completeQuiz = (attemptId: string): Promise<QuizComplete> =>
  axiosInstance.post<QuizComplete>(`/quiz/${attemptId}/complete`).then((r) => r.data);

export const getQuizSummary = (attemptId: string): Promise<QuizSummaryData> =>
  axiosInstance.get<QuizSummaryData>(`/quiz/${attemptId}/summary`).then((r) => r.data);
