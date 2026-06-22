import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, userApi } from '../api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const handleSave = async () => {
    await authApi.updateProfile({ name, phone });
    await refreshUser();
    toast.success('Profile updated');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await userApi.uploadProfileImage(file);
    await refreshUser();
    toast.success('Photo updated');
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="card space-y-6">
        <div className="flex items-center gap-4">
          <img src={user.profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=d946ef&color=fff`} alt="" className="w-20 h-20 rounded-full object-cover" />
          <label className="btn-secondary text-sm cursor-pointer">
            Change Photo
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={user.email} disabled className="input-field bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          {!user.isPhoneVerified && <p className="text-yellow-600 text-sm mt-1">Phone not verified</p>}
        </div>
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
          <span className="font-medium">Loyalty Points</span>
          <span className="text-2xl font-bold text-primary-600">{user.loyaltyPoints}</span>
        </div>
        <button onClick={handleSave} className="btn-primary w-full py-3">Save Changes</button>
      </div>
    </div>
  );
}
