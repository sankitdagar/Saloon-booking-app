import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, reviewsApi } from '../api';
import { Booking } from '../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TABS = ['upcoming', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [tab, setTab] = useState('upcoming');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const statusFilter = tab === 'upcoming'
    ? ['pending', 'confirmed', 'in-progress']
    : tab === 'completed'
    ? ['completed']
    : ['cancelled', 'no-show'];

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings', tab],
    queryFn: () => bookingsApi.getMy().then((r) =>
      r.data.data.filter((b: Booking) => statusFilter.includes(b.status))
    ),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: () => { toast.success('Booking cancelled'); queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); },
    onError: () => toast.error('Cannot cancel — within cancellation window'),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('bookingId', reviewBooking!._id);
      fd.append('rating', String(rating));
      fd.append('comment', comment);
      return reviewsApi.create(fd);
    },
    onSuccess: () => { toast.success('Review submitted!'); setReviewBooking(null); queryClient.invalidateQueries({ queryKey: ['my-bookings'] }); },
  });

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
      'no-show': 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
            tab === t ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}>{t}</button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : !bookings?.length ? (
        <p className="text-center text-gray-500 py-12">No {tab} bookings.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => (
            <div key={booking._id} className="card">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <p className="font-semibold">{booking.services.map((s) => s.name).join(', ')}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(booking.date), 'dd MMM yyyy')} · {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stylist: {(booking.staffId as { userId?: { name: string } })?.userId?.name ?? 'Any Available'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColor(booking.status)}`}>{booking.status}</span>
                  <p className="font-bold text-primary-600 mt-2">₹{booking.finalAmount}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button onClick={() => cancelMutation.mutate(booking._id)} className="btn-secondary text-sm">Cancel</button>
                )}
                {booking.status === 'completed' && (
                  <button onClick={() => setReviewBooking(booking)} className="btn-primary text-sm">Leave Review</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setRating(r)} className={`text-2xl ${r <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field mb-4" rows={3} placeholder="Share your experience..." />
            <div className="flex gap-2">
              <button onClick={() => reviewMutation.mutate()} className="btn-primary flex-1">Submit</button>
              <button onClick={() => setReviewBooking(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
