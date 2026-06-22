import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import { format } from 'date-fns';
import { Notification } from '../types';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userApi.getNotifications().then((r) => r.data.data),
  });

  const markAll = useMutation({
    mutationFn: () => userApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {data?.unreadCount > 0 && (
          <button onClick={() => markAll.mutate()} className="text-sm text-primary-600 hover:underline">Mark all read</button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: Notification) => (
            <div key={n._id} className={`card ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
              <div className="flex justify-between">
                <h3 className="font-medium">{n.title}</h3>
                <span className="text-xs text-gray-400">{format(new Date(n.createdAt), 'dd MMM, HH:mm')}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
