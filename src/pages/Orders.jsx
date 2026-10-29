import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';
import { EmptyState } from '../components/common/Notice';
import AccountNav from '../components/account/AccountNav';

export default function Orders() {
  const { mealPlans, removeMealPlan } = useApp();
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Account</p>
      <h1 className="mt-2 text-3xl font-black">Meal-plan history</h1>
      <p className="mt-2 text-sm text-[#777]">These are recipe collections saved on this device. They are not food orders.</p>
      <div className="mt-6"><AccountNav /></div>
      {mealPlans.length === 0 ? (
        <EmptyState title="No saved meal plans" message="Build a recipe collection and save it to revisit your cooking ideas." action={<Link to="/recipes" className="mt-5 inline-block font-bold text-[#176B45]">Discover recipes</Link>} />
      ) : (
        <div className="space-y-3">{mealPlans.map((plan) => (
          <article key={plan.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E8E8E8] bg-white p-5">
            <div><p className="font-bold">{plan.id}</p><p className="mt-1 text-sm text-[#777]">{formatDate(plan.createdAt)} · {plan.recipeIds.length} {plan.recipeIds.length === 1 ? 'recipe' : 'recipes'} · Saved locally</p></div>
            <Link to={`/orders/${plan.id}`} className="font-bold text-[#176B45]">View recipes →</Link>
            <button type="button" onClick={() => removeMealPlan(plan.id)} className="text-sm font-semibold text-[#777] hover:text-red-700">Delete plan</button>
          </article>
        ))}</div>
      )}
    </section>
  );
}
