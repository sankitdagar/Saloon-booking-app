import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function AboutPage() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  });

  if (!settings) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">{settings.businessName}</h1>
        <p className="text-gray-500 mt-2 text-lg">{settings.tagline}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-4">About Us</h2>
          <p className="text-gray-600 leading-relaxed">{settings.about}</p>
          <div className="mt-6 space-y-3">
            <p className="flex items-center gap-2 text-gray-600"><MapPin size={18} className="text-primary-600" /> {settings.address.street}, {settings.address.city}, {settings.address.state} {settings.address.pincode}</p>
            <p className="flex items-center gap-2 text-gray-600"><Phone size={18} className="text-primary-600" /> {settings.contactInfo.phone}</p>
            <p className="flex items-center gap-2 text-gray-600"><Mail size={18} className="text-primary-600" /> {settings.contactInfo.email}</p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Working Hours</h2>
          <div className="card space-y-2">
            {DAYS.map((day) => {
              const hours = settings.workingHours[day];
              return (
                <div key={day} className="flex justify-between text-sm">
                  <span className="capitalize font-medium flex items-center gap-1"><Clock size={14} /> {day}</span>
                  <span className={hours?.isOpen ? 'text-gray-600' : 'text-red-500'}>
                    {hours?.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {settings.galleryImages?.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {settings.galleryImages.map((img: string, i: number) => (
              <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full h-48 object-cover rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {settings.location?.lat !== 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Find Us</h2>
          <iframe
            title="Location"
            className="w-full h-80 rounded-xl border"
            src={`https://maps.google.com/maps?q=${settings.location.lat},${settings.location.lng}&z=15&output=embed`}
          />
        </div>
      )}
    </div>
  );
}
