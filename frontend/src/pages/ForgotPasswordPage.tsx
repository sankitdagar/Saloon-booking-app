import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authApi.forgotPassword(email);
    setSent(true);
    toast.success('Reset link sent if email exists');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
        {sent ? (
          <p className="text-gray-600">Check your email for a reset link. <Link to="/login" className="text-primary-600">Back to login</Link></p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="your@email.com" required />
            <button type="submit" className="btn-primary w-full py-3">Send Reset Link</button>
          </form>
        )}
      </div>
    </div>
  );
}
