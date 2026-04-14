import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Terminal, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { register as registerApi } from '@/api/authApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine((v) => v === true, 'You must accept the terms to continue'),
});

type FormValues = z.infer<typeof schema>;

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length < 8) return { score: 1, label: 'Weak', color: '#ba1a1a' };
  const checks = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length;
  if (checks <= 2) return { score: 2, label: 'Fair', color: '#D97706' };
  if (checks === 3) return { score: 3, label: 'Strong', color: '#6a1edb' };
  return { score: 4, label: 'Very Strong', color: '#10B981' };
}

const FEATURES = [
  { title: 'Adaptive Curriculum', desc: 'Lessons that evolve based on your performance.' },
  { title: 'AI-Powered Debugging', desc: 'Real-time feedback on your code blocks.' },
  { title: 'Industry Projects', desc: 'Build real-world portfolios as you learn.' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  });

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      const response = await registerApi({ name: data.name, email: data.email, password: data.password });
      login(response.token, { id: response.id, email: response.email, name: response.name });
      toast.success("Account created! Let's get started.");
      navigate('/diagnostic');
    } catch (err: unknown) {
      // GlobalExceptionHandler returns { "message": "..." } for all error responses
      const errData = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setApiError(errData?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-hidden">
      {/* Left Panel — Brand */}
      <section
        className="hidden md:flex w-[45%] flex-col justify-between p-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #004ac6 0%, #6a1edb 100%)' }}
      >
        <div
          className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: '#ffffff' }}
        />
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: '#8343f4' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Terminal className="text-[#004ac6] w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">AdaptIQ</span>
        </div>

        {/* Copy + features */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-8">
            Your personalised coding journey starts here
          </h1>
          <ul className="space-y-6">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <div
                  className="mt-1 p-1 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <Check className="text-white w-3 h-3" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{f.title}</p>
                  <p className="text-sm opacity-75" style={{ color: '#dbe1ff' }}>
                    {f.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div
          className="relative z-10 p-6 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <p className="text-white text-sm font-medium italic">
            "The speed of progress I achieved with AdaptIQ surpassed any traditional bootcamp."
          </p>
          <p className="text-white/60 text-xs mt-2">— James K., Lead Architect</p>
        </div>
      </section>

      {/* Right Panel — Form */}
      <section className="w-full md:w-[55%] bg-[#f9f9ff] flex flex-col justify-center items-center p-8 md:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-12">
            <Terminal className="text-[#004ac6] w-7 h-7" />
            <span className="text-2xl font-black tracking-tight" style={{ color: '#141b2b' }}>
              AdaptIQ
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#141b2b' }}>
              Create your account
            </h2>
            <p className="font-medium" style={{ color: '#434655' }}>
              Join 50k+ developers mastering modern code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold ml-1"
                style={{ color: '#141b2b' }}
                htmlFor="name"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="w-full px-5 py-4 rounded-xl outline-none transition-all bg-[#f1f3ff] focus:bg-[#dce2f7] placeholder:text-[#737686] text-[#141b2b]"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs font-medium ml-1" style={{ color: '#ba1a1a' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold ml-1"
                style={{ color: '#141b2b' }}
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="w-full px-5 py-4 rounded-xl outline-none transition-all bg-[#f1f3ff] focus:bg-[#dce2f7] placeholder:text-[#737686] text-[#141b2b]"
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
              <label
                className="block text-sm font-semibold"
                style={{ color: '#141b2b' }}
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 pr-12 rounded-xl outline-none transition-all bg-[#f1f3ff] focus:bg-[#dce2f7] placeholder:text-[#737686] text-[#141b2b]"
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

              {/* Strength indicator */}
              {passwordValue.length > 0 && (
                <div className="px-1">
                  <div className="flex gap-1.5 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: strength.score >= level ? strength.color : '#dce2f7',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-[10px] uppercase tracking-wider font-bold"
                      style={{ color: strength.color }}
                    >
                      Strength: {strength.label}
                    </span>
                    <span className="text-[10px] italic" style={{ color: '#434655' }}>
                      Must be at least 8 characters
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-xs font-medium ml-1" style={{ color: '#ba1a1a' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3 px-1">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 rounded accent-[#004ac6] cursor-pointer"
                {...register('terms')}
              />
              <label
                className="text-xs leading-relaxed cursor-pointer"
                style={{ color: '#434655' }}
                htmlFor="terms"
              >
                I agree to the{' '}
                <span className="font-semibold" style={{ color: '#004ac6' }}>
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="font-semibold" style={{ color: '#004ac6' }}>
                  Privacy Policy
                </span>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs font-medium ml-1 -mt-4" style={{ color: '#ba1a1a' }}>
                {errors.terms.message}
              </p>
            )}

            {/* API error */}
            {apiError && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: '#ffdad6', color: '#93000a' }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#ba1a1a' }} />
                <p className="text-sm font-bold">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-60 mt-4"
              style={{
                background: 'linear-gradient(135deg, #004ac6 0%, #2563eb 100%)',
                boxShadow: '0 8px 24px rgba(0,74,198,0.25)',
              }}
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
              {!isSubmitting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium" style={{ color: '#434655' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold hover:underline ml-1"
              style={{ color: '#004ac6' }}
            >
              Log in here
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
