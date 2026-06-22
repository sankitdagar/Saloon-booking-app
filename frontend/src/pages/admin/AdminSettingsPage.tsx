import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (fd: FormData) => settingsApi.update(fd),
    onSuccess: () => { toast.success('Settings saved'); queryClient.invalidateQueries({ queryKey: ['settings'] }); },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateMutation.mutate(new FormData(e.currentTarget));
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Saloon Settings</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input name="businessName" defaultValue={settings.businessName} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input name="tagline" defaultValue={settings.tagline} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea name="about" defaultValue={settings.about} className="input-field" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="address[street]" defaultValue={settings.address.street} className="input-field" placeholder="Street" />
          <input name="address[city]" defaultValue={settings.address.city} className="input-field" placeholder="City" />
          <input name="address[state]" defaultValue={settings.address.state} className="input-field" placeholder="State" />
          <input name="address[pincode]" defaultValue={settings.address.pincode} className="input-field" placeholder="Pincode" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="contactInfo[phone]" defaultValue={settings.contactInfo.phone} className="input-field" placeholder="Phone" />
          <input name="contactInfo[email]" defaultValue={settings.contactInfo.email} className="input-field" placeholder="Email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <input name="logo" type="file" accept="image/*" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gallery Images</label>
          <input name="gallery" type="file" accept="image/*" multiple className="input-field" />
        </div>
        <button type="submit" className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
