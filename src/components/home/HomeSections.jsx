import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorNotice } from '../common/Notice';
import RecipeGrid from '../products/RecipeGrid';
import { getDiscoverRecipes, MEALDB_AREAS } from '../../services/mealService';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#E2F5E9]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#176B45]">Recipes and food discovery</span>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[1.03] tracking-tight text-[#202820] sm:text-6xl">Taste the world.<br /><span className="text-[#176B45]">Discover your next dish.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#59635a]">Explore real recipe information from TheMealDB, including ingredients and cooking instructions.</p>
          <Link to="/recipes" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-6 py-3.5 font-bold text-white shadow transition hover:bg-[#105437]">Explore recipes <ArrowRight size={18} /></Link>
          <p className="mt-5 text-xs text-[#667369]">Recipe discovery and meal planning only. No restaurant ordering, inventory, delivery, or payments.</p>
        </div>
        <div className="relative mx-auto flex h-64 w-full max-w-lg items-center justify-center sm:h-80" aria-hidden="true">
          <div className="absolute h-64 w-64 rounded-full bg-[#F59E0B]/20 sm:h-80 sm:w-80" />
          <div className="absolute h-52 w-52 rounded-full border-2 border-white/70 sm:h-64 sm:w-64" />
          <div className="relative grid h-44 w-44 rotate-3 place-items-center rounded-full border-[10px] border-white bg-[#F59E0B] text-8xl shadow-2xl sm:h-56 sm:w-56 sm:text-9xl">🍲</div>
          <div className="absolute right-5 top-6 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-lg">Ideas from around the world</div>
          <div className="absolute bottom-8 left-0 rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-lg">Plan what to cook</div>
        </div>
      </div>
    </section>
  );
}

export function CuisineCategories() {
  const cuisines = MEALDB_AREAS.slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Explore</p><h2 className="mt-2 text-3xl font-black">Find your flavour</h2></div>
        <Link to="/recipes" className="text-sm font-bold text-[#176B45]">All recipes <ArrowRight className="ml-1 inline" size={16} /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link to="/cuisine/nigerian" className="group rounded-2xl border border-[#E8E8E8] bg-white p-4 transition hover:-translate-y-1 hover:border-[#176B45]/40 hover:shadow-md">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E2F5E9] text-2xl">🇳🇬</span>
          <span className="mt-3 block font-bold">Nigerian meals</span>
          <span className="mt-1 block text-xs text-[#777]">Browse the local food guide</span>
        </Link>
        {cuisines.map((cuisine, index) => (
          <Link to={`/cuisine/${encodeURIComponent(cuisine.toLowerCase().replace(/\s+/g, '-'))}`} key={cuisine} className="group rounded-2xl border border-[#E8E8E8] bg-white p-4 transition hover:-translate-y-1 hover:border-[#176B45]/40 hover:shadow-md">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E2F5E9] text-2xl">{['🍝', '🍔', '🥘', '🍜', '🥗', '🥟', '🍛', '🍲'][index]}</span>
            <span className="mt-3 block font-bold">{cuisine}</span>
            <span className="mt-1 block text-xs text-[#777]">TheMealDB cuisine search</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedMeals() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      getDiscoverRecipes({ signal: controller.signal, number: 8 })
        .then((results) => {
          if (current) setRecipes(results);
        })
        .catch((requestError) => {
          if (current && requestError.name !== 'AbortError') setError(requestError);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 0);
    return () => {
      current = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [retry]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">From TheMealDB</p><h2 className="mt-2 text-3xl font-black">Discover recipes</h2><p className="mt-2 text-sm text-[#777]">Recipe results are informational and are not products for sale.</p></div>
      {error && <div className="mb-5"><ErrorNotice message={error.message} onRetry={() => { setError(null); setRetry((attempt) => attempt + 1); }} /></div>}
      <RecipeGrid recipes={recipes} loading={loading} emptyTitle="No recipes available right now" emptyMessage="Try recipe search or come back when the recipe service is available." />
      <Link to="/recipes" className="mt-6 inline-flex items-center gap-2 font-bold text-[#176B45]">Search all recipes <ArrowRight size={16} /></Link>
    </section>
  );
}

export function Promotions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-[#176B45] px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:px-10">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#bfe8cd]">Plan your next meal</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Save recipes worth making.</h2><p className="mt-2 max-w-xl text-sm text-white/75">Collect recipes on this device and revisit their ingredients and instructions.</p></div>
        <Link to="/recipes" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#202820] sm:mt-0">Find recipes <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: Search, title: 'Discover recipes', text: 'Search recipe data and supported cuisine filters from TheMealDB.' },
    { icon: Heart, title: 'Save favourites', text: 'Keep recipe IDs in your browser wishlist to revisit later.' },
    { icon: BookOpen, title: 'Build a meal plan', text: 'Collect recipes and save a local cooking plan—no order is placed.' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Simple and delicious</p><h2 className="mt-2 text-3xl font-black">How CHI EATS works</h2></div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article className="rounded-2xl bg-white p-6 text-center shadow-sm" key={title}><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#E2F5E9] text-[#176B45]"><Icon size={25} /></span><span className="mt-4 block text-xs font-bold text-[#F59E0B]">STEP 0{index + 1}</span><h3 className="mt-1 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#777]">{text}</p></article>)}</div>
    </section>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  function subscribe(event) {
    event.preventDefault();
    setSubmitted(true);
    setEmail('');
  }
  return <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6"><form onSubmit={subscribe} className="rounded-3xl bg-[#E2F5E9] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Stay in the loop</p><h2 className="mt-2 text-2xl font-black">A little food joy in your inbox.</h2><p className="mt-1 text-sm text-[#667369]">Newsletter sign-up is a prototype and does not transmit your email.</p>{submitted && <p role="status" className="mt-2 text-sm font-semibold text-[#176B45]">This demo does not submit or store email addresses.</p>}</div><div className="mt-5 flex w-full gap-2 sm:mt-0 sm:max-w-md"><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" required type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} placeholder="Your email address" className="min-w-0 flex-1 rounded-xl border border-white bg-white px-4 py-3 text-sm outline-[#176B45]" /><button className="rounded-xl bg-[#176B45] px-5 font-bold text-white">Preview</button></div></form></section>;
}
