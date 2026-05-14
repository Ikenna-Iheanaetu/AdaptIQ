import axiosInstance from './axiosInstance';

export interface TopicItem {
  id: string;
  name: string;
  description: string;
}

export interface RecentAttempt {
  attemptId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface TopicDetailItem {
  id: string;
  name: string;
  description: string;
  averageScore: number;
  bestScore: number;
  quizzesTaken: number;
  lastQuizDate: string | null;
  recentAttempts: RecentAttempt[];
}

export const getTopics = (): Promise<TopicItem[]> =>
  axiosInstance.get<TopicItem[]>('/topics').then((r) => r.data);

export const getTopicDetail = (id: string): Promise<TopicDetailItem> =>
  axiosInstance.get<TopicDetailItem>(`/topics/${id}`).then((r) => r.data);
