import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import DiagnosticQuizPage from "@/pages/DiagnosticQuizPage";
import DashboardPage from "@/pages/DashboardPage";
import TopicLibraryPage from "@/pages/TopicLibraryPage";
import TopicDetailPage from "@/pages/TopicDetailPage";
import QuizPage from "@/pages/QuizPage";
import QuizSummaryPage from "@/pages/QuizSummaryPage";
import QuizHistoryPage from "@/pages/QuizHistoryPage";
import ProfilePage from "@/pages/ProfilePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/diagnostic" element={<DiagnosticQuizPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/topics" element={<TopicLibraryPage />} />
            <Route path="/topics/:topicId" element={<TopicDetailPage />} />
            <Route path="/history" element={<QuizHistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/quiz/:attemptId" element={<QuizPage />} />
          <Route
            path="/quiz/:attemptId/summary"
            element={<QuizSummaryPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
