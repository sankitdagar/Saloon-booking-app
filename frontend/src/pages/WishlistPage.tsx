import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';
import { Service } from '../types';

export default function WishlistPage() {
  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userApi.getWishlist().then((r) => r.data.data),
  });

  const services = wishlist?.services ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>
      {services.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No saved services. <Link to="/services" className="text-primary-600">Browse services</Link></p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc: Service) => (
            <Link key={svc._id} to={`/services/${svc._id}`} className="card flex gap-4 hover:shadow-md">
              <img src={svc.image || 'https://placehold.co/100x100'} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <h3 className="font-semibold">{svc.name}</h3>
                <p className="text-sm text-gray-500">{svc.category}</p>
                <p className="text-primary-600 font-bold mt-1">₹{svc.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
