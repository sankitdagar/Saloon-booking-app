import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    setLoading(true);
    try {
      await authApi.verifyOtp(otp);
      toast.success('Phone verified!');
      navigate('/');
    } catch {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await authApi.resendOtp();
    toast.success('OTP resent to your email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Verify Phone</h1>
        <p className="text-gray-500 mb-6">Enter the 6-digit OTP sent to your email</p>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="input-field text-center text-2xl tracking-widest mb-4"
          placeholder="000000"
        />
        <button onClick={handleVerify} disabled={loading || otp.length !== 6} className="btn-primary w-full py-3 mb-3">
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        <button onClick={handleResend} className="text-sm text-primary-600 hover:underline">Resend OTP</button>
      </div>
    </div>
  );
}
