import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api';
import { Booking } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-bookings', statusFilter],
    queryFn: () => bookingsApi.getAll({ ...(statusFilter && { status: statusFilter }), limit: 50 }).then((r) => r.data.data.bookings),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => bookingsApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => bookingsApi.markPaid(id),
    onSuccess: () => { toast.success('Marked as paid'); queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1 rounded-full text-sm ${!statusFilter ? 'bg-primary-600 text-white' : 'bg-white border'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-sm capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border'}`}>{s}</button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-3">Date</th><th className="pb-3">Customer</th><th className="pb-3">Services</th><th className="pb-3">Amount</th><th className="pb-3">Status</th><th className="pb-3">Payment</th><th className="pb-3">Actions</th>
          </tr></thead>
          <tbody>
            {data?.map((b: Booking) => (
              <tr key={b._id} className="border-b border-gray-50">
                <td className="py-3">{format(new Date(b.date), 'dd MMM')} {b.startTime}</td>
                <td>{(b.customerId as { name: string }).name}</td>
                <td className="max-w-[150px] truncate">{b.services.map((s) => s.name).join(', ')}</td>
                <td>₹{b.finalAmount}</td>
                <td><span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">{b.status}</span></td>
                <td className="capitalize">{b.paymentStatus}</td>
                <td>
                  <select
                    value={b.status}
                    onChange={(e) => statusMutation.mutate({ id: b._id, status: e.target.value })}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {b.paymentMethod === 'pay_at_saloon' && b.paymentStatus === 'pending' && (
                    <button onClick={() => markPaidMutation.mutate(b._id)} className="ml-1 text-xs text-green-600 hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
