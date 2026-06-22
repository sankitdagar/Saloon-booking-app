import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi } from '../../api';
import { Coupon } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: coupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => couponsApi.getAll().then((r) => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponsApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await couponsApi.create({
        code: form.get('code'),
        description: form.get('description'),
        discountType: form.get('discountType'),
        discountValue: Number(form.get('discountValue')),
        minOrderAmount: Number(form.get('minOrderAmount') || 0),
        validFrom: form.get('validFrom'),
        validTo: form.get('validTo'),
        usageLimit: Number(form.get('usageLimit')),
      });
      toast.success('Coupon created');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Coupon</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="code" required className="input-field uppercase" placeholder="CODE" />
            <select name="discountType" className="input-field"><option value="percentage">Percentage</option><option value="flat">Flat</option></select>
            <input name="discountValue" type="number" required className="input-field" placeholder="Value" />
            <input name="minOrderAmount" type="number" className="input-field" placeholder="Min order" defaultValue={0} />
            <input name="validFrom" type="date" required className="input-field" />
            <input name="validTo" type="date" required className="input-field" />
            <input name="usageLimit" type="number" required className="input-field" placeholder="Usage limit" defaultValue={100} />
            <input name="description" className="input-field" placeholder="Description" />
            <div className="flex gap-2"><button type="submit" className="btn-primary">Create</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-3">Code</th><th className="pb-3">Type</th><th className="pb-3">Value</th><th className="pb-3">Used</th><th className="pb-3">Valid To</th><th className="pb-3"></th>
          </tr></thead>
          <tbody>
            {coupons?.map((c: Coupon) => (
              <tr key={c._id} className="border-b border-gray-50">
                <td className="py-3 font-mono font-medium">{c.code}</td>
                <td>{c.discountType}</td>
                <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td>{c.usedCount}/{c.usageLimit}</td>
                <td>{new Date(c.validTo).toLocaleDateString()}</td>
                <td><button onClick={() => deleteMutation.mutate(c._id)} className="text-red-500"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
