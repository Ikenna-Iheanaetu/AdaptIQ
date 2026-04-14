import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Terminal, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { login as loginApi } from '@/api/authApi';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      const response = await loginApi(data);
      login(response.token, { id: response.id, email: response.email, name: response.name });
      toast.success(`Welcome back, ${response.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      // GlobalExceptionHandler returns { "message": "..." } for all error responses
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setApiError(data?.message ?? 'Incorrect email or password');
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-hidden">
      {/* Left Panel — Brand */}
      <section
        className="hidden md:flex md:w-5/12 lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00174b 0%, #004ac6 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl opacity-20"
             style={{ background: '#8343f4' }} />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-3xl opacity-30"
             style={{ background: '#004ac6' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Terminal className="text-[#004ac6] w-5 h-5" />
          </div>
          <span className="text-white text-2xl font-black tracking-tighter">AdaptIQ</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h1 className="text-white text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-8">
            Elevate your <br />
            <span style={{ color: '#dbe1ff' }}>workflow.</span>
          </h1>
          <p className="text-lg lg:text-xl max-w-md font-medium leading-relaxed opacity-90"
             style={{ color: '#b4c5ff' }}>
            The intelligent canvas where AI-driven curriculum meets high-performance engineering.
          </p>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 p-6 rounded-2xl inline-block max-w-sm"
             style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
          <p className="text-sm font-semibold italic" style={{ color: '#141b2b' }}>
            "The adaptive learning path shaved months off my transition to systems architecture."
          </p>
          <p className="text-xs mt-2 font-medium" style={{ color: '#434655' }}>
            Sarah Jenkins, Senior Developer
          </p>
        </div>
      </section>

      {/* Right Panel — Form */}
      <section className="flex-grow md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#f9f9ff]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-12">
            <Terminal className="text-[#004ac6] w-7 h-7" />
            <span className="text-xl font-black" style={{ color: '#141b2b' }}>AdaptIQ</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: '#141b2b' }}>
              Welcome back
            </h2>
            <p className="font-medium" style={{ color: '#434655' }}>
              Access your intelligent workspace to continue your progress.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1" style={{ color: '#434655' }} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="w-full h-14 px-5 rounded-xl font-medium outline-none transition-all duration-200 bg-[#f1f3ff] focus:bg-[#dce2f7] placeholder:text-[#737686] text-[#141b2b]"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium ml-1" style={{ color: '#ba1a1a' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold" style={{ color: '#434655' }} htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
                  style={{ color: '#004ac6' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-14 px-5 pr-12 rounded-xl font-medium outline-none transition-all duration-200 bg-[#f1f3ff] focus:bg-[#dce2f7] placeholder:text-[#737686] text-[#141b2b]"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#737686' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium ml-1" style={{ color: '#ba1a1a' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-3 p-4 rounded-xl"
                   style={{ background: '#ffdad6', color: '#93000a' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ba1a1a' }} />
                <p className="text-sm font-bold">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)',
                         boxShadow: '0 8px 24px rgba(0,74,198,0.25)' }}
              >
                {isSubmitting ? 'Logging in…' : 'Log in'}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-medium" style={{ color: '#434655' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold hover:underline underline-offset-4"
                    style={{ color: '#004ac6' }}>
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-20 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-60"
               style={{ color: '#737686' }}>
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Support</a>
          </div>
        </div>
      </section>
    </main>
  );
}
