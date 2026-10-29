import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorNotice } from '../components/common/Notice';
import Loading from '../components/common/Loading';
import RecipeImage from '../components/products/RecipeImage';
import { getRecipeDetails, getRecipeNutrition } from '../services/mealService';
import { useApp } from '../context/AppContext';

const NUTRITION_DISCLAIMER = 'Nutrition information is an estimate based on available recipe data. Actual nutritional values may vary depending on ingredients, quantities, and preparation.';

export default function RecipeDetails() {
  const { recipeId } = useParams();
  const { wishlist, mealPlan, toggleWishlist, addToCart, removeFromCart } = useApp();
  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(async () => {
      try {
        const details = await getRecipeDetails(recipeId, { signal: controller.signal });
        const availableNutrition = await getRecipeNutrition(recipeId, { signal: controller.signal });
        if (current) {
          setRecipe(details);
          setNutrition(availableNutrition);
        }
      } catch (requestError) {
        if (current && requestError.name !== 'AbortError') setError(requestError);
      } finally {
        if (current) setLoading(false);
      }
    }, 0);
    return () => {
      current = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [recipeId, retry]);

  if (loading) return <Loading label="Loading recipe details..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-12"><ErrorNotice message={error.message} onRetry={() => setRetry((attempt) => attempt + 1)} /><Link to="/recipes" className="mt-5 inline-flex font-bold text-[#176B45]">Back to recipe search</Link></div>;
  if (!recipe) return <div className="mx-auto max-w-3xl px-4 py-12"><EmptyState title="Recipe unavailable" message="This recipe could not be loaded. Search for another recipe." action={<Link to="/recipes" className="mt-4 inline-block font-bold text-[#176B45]">Search recipes</Link>} /></div>;
  const saved = wishlist.includes(recipe.id);
  const planned = mealPlan.includes(recipe.id);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/recipes" className="inline-flex items-center gap-2 text-sm font-bold text-[#176B45]"><ArrowLeft size={17} /> Back to recipe search</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <RecipeImage recipe={recipe} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-md" />
        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">TheMealDB recipe · informational only</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{recipe.title}</h1>
          <p className="mt-4 leading-7 text-[#626a62]">{recipe.summary || 'Description unavailable for this recipe.'}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#59635a]">
            {recipe.readyInMinutes !== null && <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F0] px-3 py-2"><Clock3 size={16} /> Total: {recipe.readyInMinutes} min</span>}
            {recipe.preparationMinutes !== null && <span className="rounded-full bg-[#FFF9F0] px-3 py-2">Prep: {recipe.preparationMinutes} min</span>}
            {recipe.cookingMinutes !== null && <span className="rounded-full bg-[#FFF9F0] px-3 py-2">Cook: {recipe.cookingMinutes} min</span>}
            {recipe.servings !== null && <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF9F0] px-3 py-2"><Users size={16} /> {recipe.servings} servings</span>}
          </div>
          {recipe.readyInMinutes === null && recipe.preparationMinutes === null && recipe.cookingMinutes === null && <p className="mt-3 text-sm text-[#777]">Preparation and cooking times are unavailable.</p>}
          {recipe.servings === null && <p className="mt-2 text-sm text-[#777]">Serving information is unavailable.</p>}
          {(recipe.diets.length > 0 || recipe.intolerances.length > 0 || recipe.cuisines.length > 0 || recipe.dishTypes.length > 0) && <div className="mt-4 flex flex-wrap gap-2">{[...recipe.diets, ...recipe.intolerances.map((item) => `Avoids: ${item}`), ...recipe.cuisines, ...recipe.dishTypes].map((label) => <span key={label} className="rounded-full bg-[#E2F5E9] px-3 py-1.5 text-xs font-semibold text-[#176B45]">{label}</span>)}</div>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => toggleWishlist(recipe.id)} className="inline-flex items-center gap-2 rounded-xl border border-[#176B45] px-4 py-3 text-sm font-bold text-[#176B45]">{saved ? 'Remove from favorites' : 'Save favorite'}</button>
            <button type="button" onClick={() => planned ? removeFromCart(recipe.id) : addToCart(recipe.id)} className="rounded-xl bg-[#176B45] px-4 py-3 text-sm font-bold text-white">{planned ? 'Remove from meal plan' : 'Add to meal plan'}</button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7"><h2 className="text-2xl font-black">Ingredients</h2>{recipe.ingredients.length > 0 ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#4b514b]">{recipe.ingredients.map((ingredient, index) => <li key={`${index}-${ingredient}`}>{ingredient}</li>)}</ul> : <p className="mt-3 text-sm text-[#777]">Ingredients are unavailable for this recipe.</p>}</section>
        <section className="rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7"><h2 className="text-2xl font-black">Cooking instructions</h2>{recipe.instructions.length > 0 ? <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-[#4b514b]">{recipe.instructions.map((instruction, index) => <li key={`${index}-${instruction}`}>{instruction}</li>)}</ol> : <p className="mt-3 text-sm text-[#777]">Cooking instructions are unavailable for this recipe.</p>}</section>
      </div>

      <section className="mt-8 rounded-2xl border border-[#E8E8E8] bg-white p-5 sm:p-7" aria-labelledby="recipe-nutrition-heading">
        <h2 id="recipe-nutrition-heading" className="text-2xl font-black">Nutritional information</h2>
        {nutrition && nutrition.nutrients.length > 0 ? (
          <>
            <p className="mt-2 text-sm text-[#626a62]">
              {nutrition.servings ? `Values per serving (${nutrition.servings} servings in the recipe).` : 'Serving basis unavailable; values are shown as returned by TheMealDB.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {nutrition.nutrients.map(({ key, label, amount, unit }) => (
                <div key={key} className="rounded-xl bg-[#FFF9F0] p-3 sm:p-4"><span className="block text-xs text-[#777]">{label}</span><strong className="mt-1 block text-sm">{amount} {unit}</strong></div>
              ))}
            </div>
          </>
        ) : <p className="mt-3 text-sm text-[#777]">Nutrition information is unavailable for this recipe.</p>}
        <p className="mt-5 text-xs leading-5 text-[#777]">{NUTRITION_DISCLAIMER}</p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[#777]">
        {recipe.sourceUrl
          ? <>Recipe source: <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#176B45] underline">{recipe.sourceName || 'Original recipe'}</a>. Recipe data provided by <a href="https://www.themealdb.com" target="_blank" rel="noreferrer" className="font-semibold text-[#176B45] underline">TheMealDB</a>.</>
          : <>Recipe data provided by <a href="https://www.themealdb.com" target="_blank" rel="noreferrer" className="font-semibold text-[#176B45] underline">TheMealDB</a>.</>}
      </p>
    </article>
  );
}
