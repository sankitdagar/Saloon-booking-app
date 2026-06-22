import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesApi, settingsApi } from '../api';
import { Service } from '../types';
import { Clock, Star, ArrowRight, Shield, Sparkles, Calendar } from 'lucide-react';
import { SalonHeroIllustration } from '../components/illustrations/SalonIllustrations';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const { data: servicesData } = useQuery({
    queryKey: ['services', 'featured'],
    queryFn: () => servicesApi.getAll({ limit: 6 }).then((r) => r.data.data),
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  });

  const services: Service[] = servicesData?.services ?? [];

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-hero-gradient bg-mesh">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="badge-rose mb-4">Premium Beauty Experience</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-900 leading-tight mb-5">
                {settings?.businessName ?? 'Glamour Studio'}
                <span className="block text-rose-600 italic font-normal text-3xl md:text-4xl mt-2">
                  {settings?.tagline ?? 'Where elegance meets artistry'}
                </span>
              </h1>
              <p className="text-stone-600 text-lg mb-8 max-w-lg leading-relaxed">
                Book hair, skin, spa & makeup services with top stylists. Seamless scheduling, secure payments, and a experience you'll love.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && user?.role === 'customer' ? (
                  <Link to="/book" className="btn-gold">
                    <Calendar size={18} /> Book Appointment
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-gold">Get Started Free</Link>
                    <Link to="/login" className="btn-secondary">Sign In</Link>
                  </>
                )}
                <Link to="/services" className="btn-secondary">
                  Browse Services <ArrowRight size={16} />
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-cream-300/60">
                {[
                  { icon: Shield, text: 'Secure Booking' },
                  { icon: Star, text: 'Expert Stylists' },
                  { icon: Sparkles, text: 'Premium Care' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-stone-600">
                    <Icon size={18} className="text-gold-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <SalonHeroIllustration className="w-full max-w-md drop-shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="badge-rose mb-3">Our Services</span>
            <h2 className="section-title">Curated for You</h2>
            <p className="section-subtitle mt-2">Handpicked treatments by our master stylists</p>
          </div>
          <Link to="/services" className="btn-secondary shrink-0">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service._id} to={`/services/${service._id}`} className="card-hover group overflow-hidden !p-0">
              <div className="relative h-52 overflow-hidden">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
                <span className="absolute top-4 left-4 badge bg-white/90 text-rose-700 backdrop-blur-sm">{service.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold group-hover:text-rose-600 transition-colors">{service.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="flex items-center gap-1 text-sm text-stone-500"><Clock size={14} /> {service.durationInMinutes} min</span>
                  <span className="font-bold text-rose-600 text-lg">₹{service.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-charcoal-900" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_50%,#B86B82,transparent_50%)]" />
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to glow?</h2>
          <p className="text-cream-200/80 mb-8 text-lg">Join thousands who trust Glamour Studio for their beauty rituals.</p>
          <Link to={isAuthenticated ? '/book' : '/register'} className="btn-gold text-base">
            {isAuthenticated ? 'Book Now' : 'Create Free Account'}
          </Link>
        </div>
      </section>
    </div>
  );
}
