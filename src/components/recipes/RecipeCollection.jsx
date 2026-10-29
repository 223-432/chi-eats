import { useEffect, useState } from 'react';
import { ErrorNotice, EmptyState } from '../common/Notice';
import RecipeGrid from '../products/RecipeGrid';
import RecipeCard from '../products/RecipeCard';
import NigerianFoodCard from '../products/NigerianFoodCard';
import { getRecipeDetails } from '../../services/mealService';
import { getNigerianFoods } from '../../services/nigerianFoodService';

export default function RecipeCollection({
  recipeIds,
  onRemove,
  emptyTitle = 'No recipes saved',
  emptyMessage = 'Discover TheMealDB recipes and add them here.',
}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const ids = [...new Set(recipeIds.filter((id) => (
      (Number.isSafeInteger(id) && id > 0) ||
      (typeof id === 'string' && /^ng-[a-z0-9-]+$/.test(id))
    )))];
    if (!ids.length) {
      setRecipes([]);
      setError('');
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let current = true;
    setRecipes([]);
    setError('');
    setLoading(true);
    const timer = window.setTimeout(async () => {
      const externalIds = ids.filter((id) => typeof id === 'number');
      const localIds = ids.filter((id) => typeof id === 'string');
      const tasks = externalIds.map((id) => getRecipeDetails(id, { signal: controller.signal }));
      if (localIds.length) tasks.push(getNigerianFoods({ signal: controller.signal }));
      const results = await Promise.allSettled(tasks);
      if (!current) return;
      const availableExternal = new Map();
      externalIds.forEach((id, index) => {
        const result = results[index];
        if (result.status === 'fulfilled') availableExternal.set(id, result.value);
      });
      const localResult = localIds.length ? results[externalIds.length] : null;
      const localFoods = localResult && localResult.status === 'fulfilled' ? localResult.value : [];
      const availableLocal = new Map(localFoods.map((food) => [food.id, food]));
      const available = ids.flatMap((id) => {
        if (typeof id === 'number') return availableExternal.has(id) ? [availableExternal.get(id)] : [];
        const food = availableLocal.get(id);
        return food ? [{ ...food, localFood: true }] : [];
      });
      const failedLocalCount = !localIds.length
        ? 0
        : localResult.status !== 'fulfilled'
          ? localIds.length
          : localIds.length - localIds.filter((id) => availableLocal.has(id)).length;
      const failedCount = externalIds.length - availableExternal.size + failedLocalCount;
      setRecipes(available);
      if (failedCount) setError(`${failedCount} saved ${failedCount === 1 ? 'item could' : 'items could'} not be loaded. Retry when the recipe service is available.`);
      setLoading(false);
    }, 0);
    return () => {
      current = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [recipeIds, retry]);

  if (!recipeIds.length && !loading) return <EmptyState title={emptyTitle} message={emptyMessage} />;

  return (
    <div className="space-y-5">
      {error && <ErrorNotice message={error} onRetry={() => setRetry((attempt) => attempt + 1)} />}
      {loading && <RecipeGrid recipes={[]} loading />}
      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => recipe.localFood
            ? <NigerianFoodCard key={recipe.id} food={recipe} onRemove={onRemove} />
            : <RecipeCard key={recipe.id} recipe={recipe} onRemove={onRemove} />)}
        </div>
      )}
    </div>
  );
}
