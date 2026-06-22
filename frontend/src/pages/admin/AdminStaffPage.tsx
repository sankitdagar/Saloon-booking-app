import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi, servicesApi } from '../../api';
import { StaffMember, Service } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStaffPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: staffList } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => staffApi.getAll().then((r) => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services-list'],
    queryFn: () => servicesApi.getAll({ limit: 100 }).then((r) => r.data.data.services),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => { toast.success('Staff deactivated'); queryClient.invalidateQueries({ queryKey: ['admin-staff'] }); },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const servicesOffered = form.getAll('servicesOffered');
    try {
      await staffApi.create({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
        bio: form.get('bio'),
        servicesOffered,
      });
      toast.success('Staff created');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    } catch {
      toast.error('Failed to create staff');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Staff</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" required className="input-field" placeholder="Full name" />
            <input name="email" type="email" required className="input-field" placeholder="Email" />
            <input name="phone" required className="input-field" placeholder="Phone" />
            <input name="password" type="password" required className="input-field" placeholder="Password" />
            <textarea name="bio" className="input-field md:col-span-2" placeholder="Bio" rows={2} />
            <div className="md:col-span-2">
              <p className="text-sm font-medium mb-2">Services Offered</p>
              <div className="flex flex-wrap gap-2">
                {services?.map((s: Service) => (
                  <label key={s._id} className="flex items-center gap-1 text-sm border px-3 py-1 rounded-lg">
                    <input type="checkbox" name="servicesOffered" value={s._id} /> {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList?.map((st: StaffMember) => (
          <div key={st._id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{st.userId.name}</h3>
                <p className="text-sm text-gray-500">{st.userId.email}</p>
                <p className="text-sm mt-2">⭐ {st.rating} · {st.totalBookingsCompleted} completed</p>
              </div>
              <button onClick={() => deleteMutation.mutate(st._id)} className="text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {st.servicesOffered?.map((s) => (
                <span key={s._id} className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{s.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
