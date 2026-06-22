import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AuthIllustration } from '../components/illustrations/SalonIllustrations';
import { Sparkles } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone required'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Verify your phone with OTP.');
      navigate('/verify-otp');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-50">
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-mesh">
        <AuthIllustration className="w-full max-w-sm mb-8" />
        <h2 className="font-display text-3xl font-bold text-charcoal-900 text-center">Begin your beauty journey</h2>
        <p className="text-stone-500 text-center mt-3 max-w-sm">Create an account to book appointments, save favorites, and earn rewards.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 py-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white"><Sparkles size={18} /></span>
            <span className="font-display text-xl font-bold">Glamour Studio</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-2">Create Account</h1>
          <p className="text-stone-500 mb-8">Join Glamour Studio — it's free</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input {...register('name')} className="input-field" placeholder="Jane Doe" />
              {errors.name && <p className="text-rose-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input {...register('email')} type="email" className="input-field" />
              {errors.email && <p className="text-rose-600 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input {...register('phone')} className="input-field" placeholder="9876543210" />
              {errors.phone && <p className="text-rose-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input {...register('password')} type="password" className="input-field" />
              {errors.password && <p className="text-rose-600 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account? <Link to="/login" className="text-rose-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
