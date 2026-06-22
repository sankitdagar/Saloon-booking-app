import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api';
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const { data: booking } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  if (!booking) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
      <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-gray-500 mb-8">We've sent a confirmation to your email and phone.</p>
      <div className="card text-left space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="font-mono">{booking._id.slice(-8).toUpperCase()}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{format(new Date(booking.date), 'dd MMM yyyy')}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{booking.startTime} - {booking.endTime}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Services</span><span>{booking.services.map((s: { name: string }) => s.name).join(', ')}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-primary-600">₹{booking.finalAmount}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="capitalize">{booking.paymentMethod.replace('_', ' ')} — {booking.paymentStatus}</span></div>
      </div>
      <div className="flex gap-3 mt-8 justify-center">
        <Link to="/bookings" className="btn-primary">My Bookings</Link>
        <Link to="/" className="btn-secondary">Home</Link>
      </div>
    </div>
  );
}
