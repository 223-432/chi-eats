import { useApp } from '../context/AppContext';
import AccountNav from '../components/account/AccountNav';
import RecipeCollection from '../components/recipes/RecipeCollection';

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useApp();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Saved recipes</p>
      <h1 className="mt-2 text-3xl font-black">Your favorites</h1>
      <p className="mt-2 text-sm text-[#777]">Favorite TheMealDB recipe IDs are stored in this browser. No food inventory is saved.</p>
      <div className="mt-6"><AccountNav /></div>
      <RecipeCollection recipeIds={wishlist} onRemove={(id) => toggleWishlist(id)} emptyTitle="No favorites yet" emptyMessage="Save recipes from discovery to keep them here." />
    </section>
  );
}
