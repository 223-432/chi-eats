import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/format';
import RecipeCollection from '../components/recipes/RecipeCollection';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { mealPlans } = useApp();
  const plan = mealPlans.find((item) => item.id === orderId);
  if (!plan) return <section className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-3xl font-black">Meal plan not found</h1><Link to="/orders" className="mt-4 inline-block font-bold text-[#176B45]">Back to meal-plan history</Link></section>;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/orders" className="text-sm font-bold text-[#176B45]">← Meal-plan history</Link>
      <h1 className="mt-4 text-3xl font-black">{plan.id}</h1>
      <p className="mt-1 text-sm text-[#777]">{formatDate(plan.createdAt)} · Saved recipe collection · Not an order</p>
      <p className="mt-3 text-sm text-[#777]">Recipe details are reloaded from TheMealDB and may be unavailable if the service or recipe has changed.</p>
      <div className="mt-6"><RecipeCollection recipeIds={plan.recipeIds} emptyTitle="No recipes in this plan" emptyMessage="This saved meal plan no longer contains recipes." /></div>
    </section>
  );
}
