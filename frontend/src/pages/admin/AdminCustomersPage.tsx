import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../../api';
import { User } from '../../types';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => dashboardApi.getCustomers({ limit: 50 }).then((r) => r.data.data.customers),
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => dashboardApi.blockCustomer(id, isBlocked),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['admin-customers'] }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-gray-500">
            <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Phone</th><th className="pb-3">Points</th><th className="pb-3">Status</th><th className="pb-3">Actions</th>
          </tr></thead>
          <tbody>
            {data?.map((c: User) => (
              <tr key={c._id} className="border-b border-gray-50">
                <td className="py-3 font-medium">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.loyaltyPoints}</td>
                <td>{c.isBlocked ? <span className="text-red-500 text-xs">Blocked</span> : <span className="text-green-500 text-xs">Active</span>}</td>
                <td>
                  <button
                    onClick={() => blockMutation.mutate({ id: c._id, isBlocked: !c.isBlocked })}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {c.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
