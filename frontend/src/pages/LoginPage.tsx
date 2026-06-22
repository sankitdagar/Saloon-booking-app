import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AuthIllustration } from '../components/illustrations/SalonIllustrations';
import { Sparkles } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string })?.from ?? '/';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success('Welcome back!');
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'staff') navigate('/staff', { replace: true });
      else navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-50">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-mesh relative">
        <AuthIllustration className="w-full max-w-sm mb-8" />
        <h2 className="font-display text-3xl font-bold text-charcoal-900 text-center">Welcome back to your beauty sanctuary</h2>
        <p className="text-stone-500 text-center mt-3 max-w-sm">Sign in to manage bookings, earn loyalty points, and discover exclusive offers.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white"><Sparkles size={18} /></span>
            <span className="font-display text-xl font-bold">Glamour Studio</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-2">Sign In</h1>
          <p className="text-stone-500 mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="you@email.com" autoComplete="email" />
              {errors.email && <p className="text-rose-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-800 mb-1.5">Password</label>
              <input {...register('password')} type="password" className="input-field" placeholder="••••••••" autoComplete="current-password" />
              {errors.password && <p className="text-rose-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 font-medium">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-cream-100 border border-cream-200 text-sm text-stone-600">
            <p className="font-medium text-charcoal-800 mb-2">Demo accounts for Review:</p>
            <p>Admin: admin@saloon.com / admin12345</p>
            <p>Staff: priya@saloon.com / staff12345</p>
            <p>Customer: customer@demo.com / customer123</p>
          </div>

          <p className="text-center text-sm text-stone-500 mt-6">
            New here? <Link to="/register" className="text-rose-600 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
