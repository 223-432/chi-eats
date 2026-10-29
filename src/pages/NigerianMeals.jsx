import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorNotice } from '../components/common/Notice';
import RecipeGrid from '../components/products/RecipeGrid';
import NigerianFoodCard from '../components/products/NigerianFoodCard';
import {
  getNigerianSearchAlternatives,
  NIGERIAN_DISH_SUGGESTIONS,
  searchNigerianRecipes,
} from '../services/mealService';
import { getNigerianFoods } from '../services/nigerianFoodService';

function normalizedTitle(value) {
  return String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export default function NigerianMeals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery.toLocaleLowerCase() === 'nigerian' ? '' : initialQuery);
  const [foods, setFoods] = useState([]);
  const [category, setCategory] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);
  const [catalogRetry, setCatalogRetry] = useState(0);
  const [recipes, setRecipes] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState(null);
  const [recipeRetry, setRecipeRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let current = true;
    setCatalogLoading(true);
    setCatalogError(null);

    getNigerianFoods({ signal: controller.signal })
      .then((results) => {
        if (current) setFoods(results);
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError') setCatalogError(error);
      })
      .finally(() => {
        if (current) setCatalogLoading(false);
      });

    return () => {
      current = false;
      controller.abort();
    };
  }, [catalogRetry]);

  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) {
      setRecipes([]);
      setRecipeLoading(false);
      setRecipeError(null);
      return undefined;
    }

    const controller = new AbortController();
    let current = true;
    setRecipeLoading(true);
    setRecipeError(null);
    const timer = window.setTimeout(() => {
      searchNigerianRecipes(search, { signal: controller.signal, number: 12 })
        .then((results) => {
          if (current) setRecipes(results);
        })
        .catch((error) => {
          if (current && error.name !== 'AbortError') setRecipeError(error);
        })
        .finally(() => {
          if (current) setRecipeLoading(false);
        });
    }, 400);

    return () => {
      current = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, recipeRetry]);

  const categories = useMemo(
    () => [...new Set(foods.map((food) => food.category))],
    [foods],
  );
  const matchingFoods = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return foods.filter((food) => {
      const inCategory = !category || food.category === category;
      if (!inCategory) return false;
      if (!term || term.toLocaleLowerCase() === 'nigerian') return true;
      return [
        food.name,
        food.description,
        food.category,
        ...food.ingredients,
      ].some((value) => String(value).toLocaleLowerCase().includes(term));
    });
  }, [foods, query, category]);

  const localTitles = new Set(matchingFoods.map((food) => normalizedTitle(food.name)));
  const externalRecipes = recipes.filter((recipe) => !localTitles.has(normalizedTitle(recipe.title)));
  const alternatives = getNigerianSearchAlternatives(query);

  function changeQuery(value) {
    setQuery(value);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  function retryRecipes() {
    setRecipeError(null);
    setRecipeRetry((attempt) => attempt + 1);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-[#E2F5E9] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Nigerian food guide</p>
        <h1 className="mt-2 text-3xl font-black">Nigerian meals</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#59635a]">Browse the local CHI EATS recipe guide or search TheMealDB for additional recipe information. These guides are informational only—not restaurant inventory, prices, or delivery availability.</p>
        <form onSubmit={(event) => event.preventDefault()} className="mt-5 max-w-3xl">
          <div className="flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white p-2">
            <Search size={19} className="ml-2 shrink-0 text-[#777]" />
            <label htmlFor="nigerian-food-search" className="sr-only">Search Nigerian foods</label>
            <input
              id="nigerian-food-search"
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search Jollof Rice, Egusi Soup, Moi Moi..."
              className="min-w-0 flex-1 px-1 py-2 text-sm outline-none"
            />
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#59635a]">Popular Nigerian dish searches</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Nigerian dish suggestions">
              {NIGERIAN_DISH_SUGGESTIONS.map((dish) => (
                <button
                  type="button"
                  key={dish}
                  onClick={() => changeQuery(dish)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${query.toLocaleLowerCase() === dish.toLocaleLowerCase() ? 'border-[#176B45] bg-[#176B45] text-white' : 'border-[#d4e4d7] bg-white text-[#176B45] hover:bg-[#f4fbf6]'}`}
                >{dish}</button>
              ))}
            </div>
          </div>
          <label className="grid gap-1 text-xs font-semibold text-[#59635a]">
            Food category
            <select
              aria-label="Food category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="min-w-48 rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#202820]"
            >
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="local-food-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Available offline from the app catalogue</p>
            <h2 id="local-food-heading" className="mt-1 text-2xl font-black">Local Nigerian food guides</h2>
          </div>
          {!catalogLoading && !catalogError && <p className="text-sm text-[#777]">{matchingFoods.length} {matchingFoods.length === 1 ? 'food' : 'foods'}</p>}
        </div>
        {catalogError && <div className="mb-5"><ErrorNotice message={catalogError.message} onRetry={() => setCatalogRetry((attempt) => attempt + 1)} /></div>}
        {catalogLoading && <RecipeGrid recipes={[]} loading />}
        {!catalogLoading && !catalogError && matchingFoods.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {matchingFoods.map((food) => <NigerianFoodCard key={food.id} food={food} />)}
          </div>
        )}
        {!catalogLoading && !catalogError && matchingFoods.length === 0 && (
          <EmptyState title="No local Nigerian food guides found" message={query ? `The local guide has no entry matching “${query}”. Try a suggestion or browse all categories.` : 'No food guides are available for this category.'} />
        )}
      </section>

      {query.trim().length >= 2 && (
        <section className="mt-12 border-t border-[#e7e4dc] pt-8" aria-labelledby="mealdb-results-heading">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">External recipe search</p>
            <h2 id="mealdb-results-heading" className="mt-1 text-2xl font-black">TheMealDB recipe matches</h2>
            <p className="mt-2 text-sm text-[#777]">These external recipe results are kept separate from the local food guide and are not products for sale.</p>
          </div>
          {recipeLoading && <RecipeGrid recipes={[]} loading />}
          {!recipeLoading && recipeError && <ErrorNotice message={recipeError.message} onRetry={retryRecipes} />}
          {!recipeLoading && !recipeError && externalRecipes.length > 0 && (
            <>
              <p className="mb-4 text-sm text-[#777]">{externalRecipes.length} TheMealDB {externalRecipes.length === 1 ? 'recipe' : 'recipes'} found</p>
              <RecipeGrid recipes={externalRecipes} />
            </>
          )}
          {!recipeLoading && !recipeError && externalRecipes.length === 0 && (
            <EmptyState
              title={recipes.length ? 'No additional external matches' : 'No TheMealDB recipes found'}
              message={recipes.length ? 'The exact external recipe titles are already represented in the local guide.' : `No matching recipe was returned by TheMealDB for “${query}”. Local Nigerian food guides remain available above.`}
              action={alternatives.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#59635a]">Try an alternate search term</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    {alternatives.map((term) => <button type="button" key={term} onClick={() => changeQuery(term)} className="rounded-full border border-[#176B45] bg-white px-4 py-2 text-sm font-semibold text-[#176B45] hover:bg-[#f4fbf6]">{term}</button>)}
                  </div>
                </div>
              ) : null}
            />
          )}
        </section>
      )}
    </section>
  );
}
