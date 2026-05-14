import axiosInstance from './axiosInstance';

export interface TopicProgressItem {
  topicId: string;
  topicName: string;
  topicDescription: string;
  proficiencyLevel: string | null;
  averageScore: number;
  attempts: number;
  lastQuizDate: string | null;
}

export interface RecentScore {
  attemptId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface DashboardData {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  strongestTopicName: string | null;
  weakestTopicName: string | null;
  topicProgress: TopicProgressItem[];
  recommendations: { id: string; name: string; description: string }[];
  recentScores: RecentScore[];
}

export interface HistoryAttempt {
  attemptId: string;
  topicId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  difficultyStart: string | null;
  difficultyEnd: string | null;
}

export const getDashboard = (): Promise<DashboardData> =>
  axiosInstance.get<DashboardData>('/progress/dashboard').then((r) => r.data);

export const getHistory = (): Promise<HistoryAttempt[]> =>
  axiosInstance.get<HistoryAttempt[]>('/progress/history').then((r) => r.data);

export const getTopicProgress = (): Promise<TopicProgressItem[]> =>
  axiosInstance.get<TopicProgressItem[]>('/progress/topics').then((r) => r.data);
