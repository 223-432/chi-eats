import RecipeCard from './RecipeCard';
import { EmptyState } from '../common/Notice';

function RecipeSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-[#E2F5E9]" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-28 animate-pulse rounded bg-[#E2F5E9]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#E2F5E9]" />
        <div className="h-10 animate-pulse rounded bg-[#FFF9F0]" />
      </div>
    </div>
  );
}

export default function RecipeGrid({
  recipes,
  loading = false,
  emptyTitle = 'No recipes found',
  emptyMessage = 'Try another search or remove some filters.',
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Loading recipes">
        {Array.from({ length: 8 }, (_, index) => <RecipeSkeleton key={index} />)}
      </div>
    );
  }
  if (!recipes.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  );
}
