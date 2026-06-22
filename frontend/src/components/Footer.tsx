import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </span>
            <span className="font-display text-xl font-bold text-white">Glamour Studio</span>
          </div>
          <p className="text-cream-300/80 text-sm leading-relaxed max-w-md">
            Your sanctuary for hair, skin, spa & beauty. Book premium services with expert stylists in under two minutes.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
          <div className="space-y-2.5 text-sm">
            <Link to="/services" className="block hover:text-rose-300 transition-colors">Services</Link>
            <Link to="/about" className="block hover:text-rose-300 transition-colors">About Us</Link>
            <Link to="/login" className="block hover:text-rose-300 transition-colors">Sign In</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
          <div className="space-y-3 text-sm text-cream-300/80">
            <p className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-gold-500" /> 123 MG Road, Bangalore</p>
            <p className="flex items-center gap-2"><Phone size={16} className="text-gold-500" /> +91 98765 43210</p>
            <p className="flex items-center gap-2"><Mail size={16} className="text-gold-500" /> info@glamourstudio.com</p>
          </div>
        </div>
      </div>
      <div className="border-t border-charcoal-700 text-center py-5 text-xs text-cream-300/50">
        © {new Date().getFullYear()} Glamour Studio. Crafted with care for your beauty journey.
      </div>
    </footer>
  );
}
