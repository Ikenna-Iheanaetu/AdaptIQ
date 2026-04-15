import axiosInstance from './axiosInstance';

export interface DiagnosticQuestion {
  questionId: string;
  attemptId: string;
  position: number;
  total: number;
  questionText: string;
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILL_BLANK';
  options: string[];
}

export interface DiagnosticAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  currentPosition: number;
  total: number;
  isLastQuestion: boolean;
  nextQuestion: DiagnosticQuestion | null;
}

export interface DiagnosticResult {
  overallScore: number;
  correctAnswers: number;
  totalQuestions: number;
}

export const diagnosticApi = {
  getStatus: () =>
    axiosInstance.get<{ completed: boolean }>('/diagnostic/status'),

  start: () =>
    axiosInstance.post<DiagnosticQuestion>('/diagnostic/start'),

  submitAnswer: (attemptId: string, questionId: string, answer: string) =>
    axiosInstance.post<DiagnosticAnswerResult>(`/diagnostic/${attemptId}/answer`, { questionId, answer }),

  complete: (attemptId: string) =>
    axiosInstance.post<DiagnosticResult>(`/diagnostic/${attemptId}/complete`),

  skip: () =>
    axiosInstance.post<{ message: string }>('/diagnostic/skip'),
};
