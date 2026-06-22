import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { LogOut, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bookings } = useQuery({
    queryKey: ['staff-bookings'],
    queryFn: () => bookingsApi.getAll().then((r) => r.data.data.bookings),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['staff-bookings'] }); },
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings?.filter((b: Booking) => format(new Date(b.date), 'yyyy-MM-dd') === today) ?? [];
  const upcoming = bookings?.filter((b: Booking) => new Date(b.date) >= new Date() && !['cancelled', 'completed', 'no-show'].includes(b.status)) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Staff Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <button onClick={async () => { await logout(); navigate('/login'); }} className="flex items-center gap-2 text-gray-500 hover:text-red-500">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar size={20} /> Today's Appointments ({todayBookings.length})</h2>
        {todayBookings.length === 0 ? (
          <p className="text-gray-500 card">No appointments today.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {todayBookings.map((b: Booking) => (
              <StaffBookingCard key={b._id} booking={b} onStatusChange={(status) => statusMutation.mutate({ id: b._id, status })} />
            ))}
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
        <div className="space-y-3">
          {upcoming.filter((b: Booking) => format(new Date(b.date), 'yyyy-MM-dd') !== today).map((b: Booking) => (
            <StaffBookingCard key={b._id} booking={b} onStatusChange={(status) => statusMutation.mutate({ id: b._id, status })} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffBookingCard({ booking, onStatusChange }: { booking: Booking; onStatusChange: (s: string) => void }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{(booking.customerId as { name: string }).name}</p>
          <p className="text-sm text-gray-500">{format(new Date(booking.date), 'dd MMM yyyy')} · {booking.startTime} - {booking.endTime}</p>
          <p className="text-sm mt-1">{booking.services.map((s) => s.name).join(', ')}</p>
        </div>
        <span className="text-xs capitalize bg-gray-100 px-2 py-1 rounded">{booking.status}</span>
      </div>
      {['confirmed', 'in-progress'].includes(booking.status) && (
        <div className="flex gap-2 mt-3">
          {booking.status === 'confirmed' && (
            <button onClick={() => onStatusChange('in-progress')} className="btn-primary text-xs py-1.5">Start</button>
          )}
          <button onClick={() => onStatusChange('completed')} className="btn-secondary text-xs py-1.5">Complete</button>
          <button onClick={() => onStatusChange('no-show')} className="text-xs text-red-500 px-3 py-1.5 border border-red-200 rounded-lg">No Show</button>
        </div>
      )}
    </div>
  );
}
