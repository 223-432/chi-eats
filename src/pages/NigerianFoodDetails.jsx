import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, Heart, Plus, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorNotice } from '../components/common/Notice';
import Loading from '../components/common/Loading';
import RecipeImage from '../components/products/RecipeImage';
import { useApp } from '../context/AppContext';
import { getNigerianFoodById } from '../services/nigerianFoodService';

export default function NigerianFoodDetails() {
  const { foodId } = useParams();
  const { wishlist, mealPlan, toggleWishlist, addToCart, removeFromCart } = useApp();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);

    getNigerianFoodById(foodId, { signal: controller.signal })
      .then((result) => {
        if (current) setFood(result);
      })
      .catch((requestError) => {
        if (current && requestError.name !== 'AbortError') setError(requestError);
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
      controller.abort();
    };
  }, [foodId, retry]);

  if (loading) return <Loading label="Loading Nigerian food guide..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorNotice message={error.message} onRetry={() => setRetry((attempt) => attempt + 1)} />
        <Link to="/cuisine/nigerian" className="mt-5 inline-flex font-bold text-[#176B45]">Back to Nigerian meals</Link>
      </div>
    );
  }
  if (!food) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState title="Food guide unavailable" message="This guide is not in the local Nigerian food catalogue." action={<Link to="/cuisine/nigerian" className="mt-4 inline-block font-bold text-[#176B45]">Browse Nigerian meals</Link>} />
      </div>
    );
  }

  const saved = wishlist.includes(food.id);
  const planned = mealPlan.includes(food.id);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/cuisine/nigerian" className="inline-flex items-center gap-2 text-sm font-bold text-[#176B45]"><ArrowLeft size={17} /> Back to Nigerian meals</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <RecipeImage
            recipe={{
              title: food.name,
              image: food.imageVerified ? food.imageUrl : null,
              imageAlt: food.imageAlt,
              imageVerified: food.imageVerified,
            }}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-md"
          />
          {food.imageVerified && <p className="mt-2 text-xs text-[#777]">Photo: <a href={food.imageSourceUrl} target="_blank" rel="noreferrer" className="underline">{food.imageCredit}</a> · <a href={food.imageLicenseUrl} target="_blank" rel="noreferrer" className="underline">{food.imageLicense}</a></p>}
        </div>
        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Local Nigerian food guide · informational only</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{food.name}</h1>
          <p className="mt-4 leading-7 text-[#626a62]">{food.description}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#59635a]">
            <span className="rounded-full bg-[#E2F5E9] px-3 py-2">{food.category}</span>
            {food.preparationMinutes != null && <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F0] px-3 py-2"><Clock3 size={16} /> Prep: {food.preparationMinutes} min</span>}
            {food.cookingMinutes != null && <span className="rounded-full bg-[#FFF9F0] px-3 py-2">Cook: {food.cookingMinutes} min</span>}
            {food.servings != null && <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F0] px-3 py-2"><Users size={16} /> {food.servings} servings</span>}
          </div>
          <p className="mt-4 text-sm leading-6 text-[#777]">This is a cooking guide, not confirmed restaurant inventory. Nutrition information has not been verified and is not provided.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => toggleWishlist(food.id)} className="inline-flex items-center gap-2 rounded-xl border border-[#176B45] px-4 py-3 text-sm font-bold text-[#176B45]"><Heart size={17} fill={saved ? 'currentColor' : 'none'} />{saved ? 'Remove from favorites' : 'Save favorite'}</button>
            <button type="button" onClick={() => planned ? removeFromCart(food.id) : addToCart(food.id)} className="inline-flex items-center gap-2 rounded-xl bg-[#176B45] px-4 py-3 text-sm font-bold text-white"><Plus size={17} />{planned ? 'Remove from meal plan' : 'Add to meal plan'}</button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <h2 className="text-2xl font-black">Ingredients</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#4b514b]">{food.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}</ul>
        </section>
        <section className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7">
          <h2 className="text-2xl font-black">Cooking instructions</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-[#4b514b]">{food.instructions.map((instruction, index) => <li key={`${index}-${instruction}`}>{instruction}</li>)}</ol>
        </section>
      </div>
    </article>
  );
}
