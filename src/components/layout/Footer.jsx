import { Link } from 'react-router-dom';
import { ChefHat, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#202820] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div><Link to="/" className="flex items-center gap-2 text-lg font-black"><ChefHat /> CHI EATS</Link><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">Discover recipes, ingredients, and cooking ideas from TheMealDB.</p></div>
        <div><h2 className="font-bold">Explore</h2><div className="mt-3 grid gap-2 text-sm text-white/70"><Link to="/recipes">Recipes</Link><Link to="/cuisine/nigerian">Nigerian meals</Link><Link to="/wishlist">Favorites</Link><Link to="/orders">Meal-plan history</Link><Link to="/about">About CHI EATS</Link></div></div>
        <div><h2 className="font-bold">Help & information</h2><div className="mt-3 grid gap-2 text-sm text-white/70"><Link to="/contact">Contact</Link><Link to="/faq">FAQ</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms</Link></div></div>
        <div><h2 className="font-bold">Get in touch</h2><div className="mt-3 grid gap-3 text-sm text-white/70"><span className="flex items-center gap-2"><MapPin size={16} /> Demo marketplace · Nigeria</span><a className="flex items-center gap-2" href="mailto:hello@chieats.example"><Mail size={16} /> hello@chieats.example</a><span className="flex items-center gap-2"><Phone size={16} /> Prototype contact details</span></div></div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} CHI EATS. Recipe discovery and meal planning only — no sales, orders, delivery, or payments.</div>
    </footer>
  );
}
