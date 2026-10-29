import { Link } from 'react-router-dom';
import AccountNav from '../components/account/AccountNav';
import RecipeCollection from '../components/recipes/RecipeCollection';
import { useApp } from '../context/AppContext';

export default function Cart() {
  const { mealPlan, removeFromCart } = useApp();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Recipe collection</p>
      <h1 className="mt-2 text-3xl font-black">Meal plan draft <span className="text-lg text-[#777]">({mealPlan.length})</span></h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#777]">This is a personal recipe collection, not a shopping cart. CHI EATS does not sell these recipes or provide inventory, prices, restaurant ordering, delivery, or payment.</p>
      <div className="mt-6"><AccountNav /></div>
      <RecipeCollection recipeIds={mealPlan} onRemove={removeFromCart} emptyTitle="Your meal plan is empty" emptyMessage="Discover TheMealDB recipes and add them to your cooking plan." />
      {mealPlan.length > 0 && <Link to="/checkout" className="mt-7 inline-flex rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white hover:bg-[#105437]">Save meal plan</Link>}
    </section>
  );
}
