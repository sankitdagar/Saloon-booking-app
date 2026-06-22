import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { StaffMember } from '../../types';

export default function AdminReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });

  const handleExport = async () => {
    const res = await dashboardApi.exportReport();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saloon-report.csv';
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2"><Download size={18} /> Export CSV</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.revenue.monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
              <Bar dataKey="total" fill="#a21caf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Staff Performance</h2>
          <div className="space-y-4">
            {stats?.staffPerformance.map((st: StaffMember) => (
              <div key={st._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{st.userId.name}</p>
                  <p className="text-sm text-gray-500">⭐ {st.rating}</p>
                </div>
                <span className="font-bold text-primary-600">{st.totalBookingsCompleted} completed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
