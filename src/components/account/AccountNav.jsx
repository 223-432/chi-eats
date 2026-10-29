import { NavLink } from 'react-router-dom';

const links = [['/profile', 'Profile'], ['/addresses', 'Saved addresses'], ['/wishlist', 'Favorites'], ['/orders', 'Meal plans']];

export default function AccountNav() {
  return <nav aria-label="Account navigation" className="mb-6 flex flex-wrap gap-2">{links.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-bold ${isActive ? 'bg-[#176B45] text-white' : 'border border-[#E8E8E8] bg-white text-[#202820]'}`}>{label}</NavLink>)}</nav>;
}
