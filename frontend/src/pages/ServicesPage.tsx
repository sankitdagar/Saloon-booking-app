import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '../api';
import { Service } from '../types';
import { Search, Clock, Star } from 'lucide-react';

const CATEGORIES = ['All', 'Hair', 'Skin', 'Spa', 'Makeup', 'Nails', 'Grooming', 'Other'];

export default function ServicesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['services', category, search],
    queryFn: () =>
      servicesApi.getAll({
        ...(category !== 'All' && { category }),
        ...(search && { search }),
      }).then((r) => r.data.data),
  });

  const services = data?.services ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No services found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <Link key={service._id} to={`/services/${service._id}`} className="card hover:shadow-md transition-shadow">
              <img src={service.image || 'https://placehold.co/600x300?text=Service'} alt={service.name} className="w-full h-48 object-cover rounded-lg mb-4" />
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">{service.category}</span>
              <h3 className="text-lg font-semibold mt-2">{service.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={14} /> {service.durationInMinutes}m</span>
                  <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> {service.averageRating || '—'}</span>
                </div>
                <span className="text-primary-600 font-bold">₹{service.price}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
