import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../components/account/AccountNav';
import { EmptyState } from '../components/common/Notice';
import RecipeCollection from '../components/recipes/RecipeCollection';
import { useApp } from '../context/AppContext';

export default function Checkout() {
  const { mealPlan, removeFromCart, saveMealPlan, notify } = useApp();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function save(event) {
    event.preventDefault();
    setError('');
    const result = saveMealPlan();
    if (!result.ok) {
      setError(result.message);
      return;
    }
    notify('Meal plan saved on this device.');
    navigate(`/order-confirmation/${result.plan.id}`, { replace: true });
  }

  if (!mealPlan.length) {
    return <section className="mx-auto max-w-4xl px-4 py-12"><EmptyState title="No recipes to save" message="Add TheMealDB recipes to your meal plan first. This action does not place an order." action={<Link to="/recipes" className="mt-5 inline-block rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">Discover recipes</Link>} /></section>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Meal planning</p>
      <h1 className="mt-2 text-3xl font-black">Review your recipes</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#777]">Save this recipe collection to your local meal-plan history. This is not checkout: no prices, inventory, restaurant order, delivery, address, or payment are involved.</p>
      <div className="mt-6"><AccountNav /></div>
      <RecipeCollection recipeIds={mealPlan} onRemove={removeFromCart} />
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={save} className="mt-7 rounded-2xl border border-[#E8E8E8] bg-white p-5">
        <p className="text-sm text-[#59635a]">Your saved plan contains {mealPlan.length} {mealPlan.length === 1 ? 'recipe' : 'recipes'}.</p>
        <button className="mt-4 rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white hover:bg-[#105437]">Save meal plan on this device</button>
      </form>
    </section>
  );
}
