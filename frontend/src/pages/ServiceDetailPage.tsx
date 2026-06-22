import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesApi, reviewsApi, userApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Clock, Star, Heart, Calendar } from 'lucide-react';
import { Review } from '../types';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data: service } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsApi.getByService(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const handleBook = () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/login', { state: { from: `/book?services=${id}` } });
      return;
    }
    navigate(`/book?services=${id}`);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }
    await userApi.toggleWishlist(id!);
    toast.success('Wishlist updated');
  };

  if (!service) return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <img src={service.image || 'https://placehold.co/600x400?text=Service'} alt={service.name} className="w-full h-80 lg:h-96 object-cover rounded-xl" />
        <div>
          <span className="badge-rose">{service.category}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-3 text-charcoal-900">{service.name}</h1>
          <div className="flex items-center gap-4 mt-3 text-stone-500">
            <span className="flex items-center gap-1"><Clock size={16} /> {service.durationInMinutes} minutes</span>
            <span className="flex items-center gap-1"><Star size={16} className="text-gold-500 fill-gold-500" /> {service.averageRating || 'New'} ({service.totalReviews} reviews)</span>
          </div>
          <p className="text-3xl font-bold text-rose-600 mt-4">₹{service.price}</p>
          <p className="text-stone-600 mt-4 leading-relaxed">{service.description}</p>
          <div className="flex gap-3 mt-8">
            <button onClick={handleBook} className="btn-gold flex items-center gap-2">
              <Calendar size={18} /> Book Now
            </button>
            {isAuthenticated && (
              <button onClick={toggleWishlist} className="btn-secondary flex items-center gap-2">
                <Heart size={18} /> Save
              </button>
            )}
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review._id} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.customerId.name}</span>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
                {review.adminResponse && (
                  <p className="mt-2 text-sm text-primary-600 bg-primary-50 p-3 rounded-lg">
                    <strong>Saloon:</strong> {review.adminResponse}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
