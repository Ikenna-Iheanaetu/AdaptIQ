import { AuthProvider } from '@/context/AuthContext';
import AppRouter from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
