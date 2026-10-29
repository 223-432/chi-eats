import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, ChefHat, Heart, Menu, Search, UserRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MEALDB_AREAS } from '../../services/mealService';

const navClass = ({ isActive }) => `whitespace-nowrap text-sm font-semibold transition hover:text-[#176B45] ${isActive ? 'text-[#176B45]' : 'text-[#4b514b]'}`;
const NAV_CUISINES = ['Italian', 'Japanese', 'Chinese', 'Indian', 'Mexican', 'Thai'];

export default function Header() {
  const { cartCount, wishlist, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function submitSearch(event) {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E8E8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-[#176B45]" aria-label="CHI EATS home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#176B45] text-white"><ChefHat size={23} /></span>
          <span className="text-xl font-black tracking-tight">CHI EATS<small className="block text-[9px] font-bold tracking-[.15em] text-[#777]">TASTE THE WORLD</small></span>
        </Link>
        <form onSubmit={submitSearch} className="hidden max-w-md flex-1 items-center rounded-full border border-[#E8E8E8] bg-[#FFF9F0] px-4 py-2 md:flex">
          <Search size={17} className="text-[#777]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Search recipes and ingredients" aria-label="Search recipes and ingredients" />
          <button className="text-sm font-bold text-[#176B45]">Search</button>
        </form>
        <div className="hidden items-center gap-4 md:flex">
          <NavLink to={user ? '/profile' : '/login'} className={navClass}><span className="flex items-center gap-1"><UserRound size={17} />{user ? user.name.split(' ')[0] : 'Account'}</span></NavLink>
          <NavLink to="/wishlist" className={navClass}><span className="flex items-center gap-1"><Heart size={17} /> Saved <b className="rounded-full bg-[#E2F5E9] px-1.5 text-xs">{wishlist.length}</b></span></NavLink>
          <NavLink to="/cart" className={navClass}><span className="flex items-center gap-1"><BookOpen size={17} /> Meal plan <b className="rounded-full bg-[#F59E0B] px-1.5 text-xs text-white">{cartCount}</b></span></NavLink>
          {user && <button onClick={logout} className="text-xs text-[#777] underline">Sign out</button>}
        </div>
        <button className="rounded-lg p-2 text-[#202820] md:hidden" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      <nav className="hidden items-center justify-center gap-7 overflow-x-auto border-t border-[#f0f0f0] px-4 py-3 md:flex">
        <NavLink to="/" end className={navClass}>Home</NavLink>
        <NavLink to="/recipes" className={navClass}>Recipes</NavLink>
        <NavLink to="/cuisine/nigerian" className={navClass}>Nigerian meals</NavLink>
        {NAV_CUISINES.filter((cuisine) => MEALDB_AREAS.includes(cuisine)).map((cuisine) => <NavLink key={cuisine} to={`/cuisine/${cuisine.toLowerCase()}`} className={navClass}>{cuisine}</NavLink>)}
      </nav>
      {mobileOpen && <div className="border-t border-[#E8E8E8] bg-white p-4 shadow-lg md:hidden">
        <form onSubmit={submitSearch} className="mb-4 flex items-center gap-2 rounded-lg border border-[#E8E8E8] px-3 py-2"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Search recipes or ingredients" /><button className="text-sm font-bold text-[#176B45]">Go</button></form>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link to="/recipes" onClick={() => setMobileOpen(false)}>Discover recipes</Link>
          <Link to="/cuisine/nigerian" onClick={() => setMobileOpen(false)}>Nigerian meals</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)}>Meal plan ({cartCount})</Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist ({wishlist.length})</Link>
          <Link to={user ? '/profile' : '/login'} onClick={() => setMobileOpen(false)}>{user ? 'Profile' : 'Login'}</Link>
          {NAV_CUISINES.map((cuisine) => <Link key={cuisine} to={`/cuisine/${cuisine.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{cuisine} recipes</Link>)}
        </div>
        {user && <button onClick={() => { logout(); setMobileOpen(false); }} className="mt-4 text-sm text-[#777] underline">Sign out</button>}
      </div>}
    </header>
  );
}
