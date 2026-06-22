import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../api';
import { Review } from '../../types';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [response, setResponse] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => reviewsApi.getAll().then((r) => r.data.data),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) => reviewsApi.respond(id, response),
    onSuccess: () => { toast.success('Response sent'); setSelected(null); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  const hideMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.hide(id, true),
    onSuccess: () => { toast.success('Review hidden'); queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="space-y-4">
        {reviews?.map((r: Review) => (
          <div key={r._id} className="card">
            <div className="flex justify-between">
              <div>
                <span className="font-medium">{r.customerId.name}</span>
                <span className="ml-2 text-yellow-400">{'★'.repeat(r.rating)}</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-600 mt-2">{r.comment}</p>
            {r.adminResponse && <p className="mt-2 text-sm text-primary-600 bg-primary-50 p-2 rounded">Response: {r.adminResponse}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setSelected(r._id)} className="text-xs text-primary-600 hover:underline">Respond</button>
              <button onClick={() => hideMutation.mutate(r._id)} className="text-xs text-red-500 hover:underline">Hide</button>
            </div>
            {selected === r._id && (
              <div className="mt-3 flex gap-2">
                <input value={response} onChange={(e) => setResponse(e.target.value)} className="input-field flex-1 text-sm" placeholder="Your response..." />
                <button onClick={() => respondMutation.mutate({ id: r._id, response })} className="btn-primary text-sm">Send</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
