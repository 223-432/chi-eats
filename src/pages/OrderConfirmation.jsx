import { CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { mealPlans } = useApp();
  const plan = mealPlans.find((item) => item.id === orderId);
  if (!plan) return <section className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-3xl font-black">Meal plan not found</h1><p className="mt-2 text-[#777]">This local recipe plan may not exist on this device.</p><Link to="/orders" className="mt-5 inline-block font-bold text-[#176B45]">View meal-plan history</Link></section>;
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center">
      <CheckCircle2 className="mx-auto text-[#176B45]" size={55} />
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Saved on this device only</p>
      <h1 className="mt-2 text-3xl font-black">Meal plan saved</h1>
      <p className="mt-3 text-sm text-[#777]">Meal plan {plan.id} was saved on {formatDate(plan.createdAt)} with {plan.recipeIds.length} {plan.recipeIds.length === 1 ? 'recipe' : 'recipes'}. This is not a food order; no restaurant, payment, or delivery provider was contacted.</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to={`/orders/${plan.id}`} className="rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white">View meal plan</Link>
        <Link to="/recipes" className="rounded-xl border border-[#E8E8E8] px-5 py-3 font-bold">Discover recipes</Link>
      </div>
    </section>
  );
}
