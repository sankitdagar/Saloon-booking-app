import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = params.get('token');
    if (!token) return toast.error('Invalid reset link');
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password reset!');
      navigate('/login');
    } catch {
      toast.error('Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="New password (min 8 chars)" minLength={8} required />
          <button type="submit" className="btn-primary w-full py-3">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
