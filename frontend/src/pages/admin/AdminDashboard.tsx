import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Booking } from '../../types';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });

  if (isLoading) return <p>Loading dashboard...</p>;
  if (!stats) return null;

  const cards = [
    { label: 'Revenue Today', value: `₹${stats.revenue.today}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Calendar, color: 'bg-yellow-500' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-blue-500' },
    { label: 'Cancellation Rate', value: `${stats.cancellationRate}%`, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${color} p-3 rounded-lg text-white`}><Icon size={24} /></div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-semibold mb-4">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.revenue.weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="total" fill="#c026d3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Top Services</h2>
          <div className="space-y-3">
            {stats.topServices.map((s: { _id: string; name: string; count: number }, i: number) => (
              <div key={s._id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="flex-1 text-sm">{s.name}</span>
                <span className="text-sm font-medium">{s.count} bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Today's Appointments</h2>
        {stats.todayBookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No appointments today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-2">Time</th><th className="pb-2">Customer</th><th className="pb-2">Services</th><th className="pb-2">Status</th>
              </tr></thead>
              <tbody>
                {stats.todayBookings.map((b: Booking) => (
                  <tr key={b._id} className="border-b border-gray-50">
                    <td className="py-3">{b.startTime}</td>
                    <td>{(b.customerId as { name: string }).name}</td>
                    <td>{b.services.map((s: { name: string }) => s.name).join(', ')}</td>
                    <td><span className="capitalize text-xs bg-gray-100 px-2 py-1 rounded">{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
