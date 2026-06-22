import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../../api';
import { Service } from '../../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminServicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => servicesApi.getAll({ limit: 100 }).then((r) => r.data.data.services),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => { toast.success('Service deactivated'); queryClient.invalidateQueries({ queryKey: ['admin-services'] }); },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      if (editId) {
        await servicesApi.update(editId, fd);
        toast.success('Service updated');
      } else {
        await servicesApi.create(fd);
        toast.success('Service created');
      }
      setShowForm(false);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    } catch {
      toast.error('Failed to save service');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Service
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editId ? 'Edit' : 'New'} Service</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" required className="input-field" placeholder="Service name" />
            <select name="category" required className="input-field">
              {['Hair', 'Skin', 'Spa', 'Makeup', 'Nails', 'Grooming', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input name="price" type="number" required className="input-field" placeholder="Price (₹)" />
            <input name="durationInMinutes" type="number" required className="input-field" placeholder="Duration (min)" defaultValue={30} />
            <textarea name="description" required className="input-field md:col-span-2" placeholder="Description" rows={3} />
            <input name="image" type="file" accept="image/*" className="input-field" />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-3">Name</th><th className="pb-3">Category</th><th className="pb-3">Price</th><th className="pb-3">Duration</th><th className="pb-3">Actions</th>
          </tr></thead>
          <tbody>
            {data?.map((s: Service) => (
              <tr key={s._id} className="border-b border-gray-50">
                <td className="py-3 font-medium">{s.name}</td>
                <td>{s.category}</td>
                <td>₹{s.price}</td>
                <td>{s.durationInMinutes}m</td>
                <td className="flex gap-2 py-3">
                  <button onClick={() => { setEditId(s._id); setShowForm(true); }} className="text-blue-500"><Pencil size={16} /></button>
                  <button onClick={() => deleteMutation.mutate(s._id)} className="text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
