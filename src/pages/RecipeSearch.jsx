import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ErrorNotice, EmptyState } from '../components/common/Notice';
import RecipeGrid from '../components/products/RecipeGrid';
import {
  searchRecipes,
  searchNigerianRecipes,
  searchRecipesByCuisine,
  searchRecipesByIngredients,
  getNigerianSearchAlternatives,
  NIGERIAN_DISH_SUGGESTIONS,
  MEALDB_AREAS,
} from '../services/mealService';

const DIETS = ['Gluten Free', 'Ketogenic', 'Vegetarian', 'Vegan', 'Paleo', 'Primal', 'Pescetarian', 'Whole30'];
const INTOLERANCES = ['Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'];
const MEAL_TYPES = ['Main Course', 'Side Dish', 'Dessert', 'Appetizer', 'Salad', 'Breakfast', 'Soup', 'Snack', 'Beverage', 'Sauce', 'Bread'];

export default function RecipeSearch({ initialCuisine = '', initialQuery = '' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? initialQuery;
  const cuisine = searchParams.get('cuisine') ?? initialCuisine;
  const mode = searchParams.get('mode') || 'recipes';
  const diet = searchParams.get('diet') || '';
  const intolerance = searchParams.get('intolerance') || '';
  const type = searchParams.get('type') || '';
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const nigerianDiscovery = mode === 'nigerian' ||
    (mode !== 'ingredients' && query.trim().toLocaleLowerCase() === 'nigerian' &&
      !cuisine && !diet && !intolerance && !type);
  const search = nigerianDiscovery && query.trim().toLocaleLowerCase() === 'nigerian' ? '' : query.trim();
  const alternativeSearches = nigerianDiscovery ? getNigerianSearchAlternatives(search) : [];
  const ingredientList = search.split(',').map((item) => item.trim()).filter(Boolean);
  const activeSearch = mode === 'ingredients'
    ? ingredientList.length > 0
    : nigerianDiscovery
      ? search.length >= 2
      : search.length >= 2 || Boolean(cuisine || diet || intolerance || type);

  useEffect(() => {
    const searchText = query.trim();
    const nigerianMode = mode === 'nigerian' ||
      (mode !== 'ingredients' && searchText.toLocaleLowerCase() === 'nigerian' &&
        !cuisine && !diet && !intolerance && !type);
    const effectiveSearch = nigerianMode && searchText.toLocaleLowerCase() === 'nigerian' ? '' : searchText;
    const ingredients = searchText.split(',').map((item) => item.trim()).filter(Boolean);
    const hasSearch = mode === 'ingredients'
      ? ingredients.length > 0
      : nigerianMode
        ? effectiveSearch.length >= 2
        : searchText.length >= 2 || Boolean(cuisine || diet || intolerance || type);
    if (!hasSearch) {
      setRecipes([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    let current = true;
    setRecipes([]);
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      const request = mode === 'ingredients'
        ? searchRecipesByIngredients(ingredients, { signal: controller.signal })
        : nigerianMode
          ? searchNigerianRecipes(effectiveSearch, { signal: controller.signal })
          : searchText.length >= 2
          ? searchRecipes(searchText, { signal: controller.signal, cuisine: cuisine || undefined, diet: diet || undefined, intolerances: intolerance || undefined, type: type || undefined })
          : cuisine
            ? searchRecipesByCuisine(cuisine, { signal: controller.signal, diet: diet || undefined, intolerances: intolerance || undefined, type: type || undefined })
            : searchRecipes('', { signal: controller.signal, diet: diet || undefined, intolerances: intolerance || undefined, type: type || undefined });
      request
        .then((results) => {
          if (current) setRecipes(results);
        })
        .catch((requestError) => {
          if (current && requestError.name !== 'AbortError') setError(requestError);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 400);

    return () => {
      current = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, cuisine, mode, diet, intolerance, type, retry]);

  function updateFilters(updates) {
    const next = { q: query, cuisine, mode, diet, intolerance, type, ...updates };
    Object.keys(next).forEach((key) => {
      if (!next[key] || (key === 'mode' && next[key] === 'recipes')) delete next[key];
    });
    setSearchParams(next, { replace: true });
    setRecipes([]);
    setError(null);
  }

  function retrySearch() {
    setError(null);
    setRetry((attempt) => attempt + 1);
  }

  function submitSearch(event) {
    event.preventDefault();
    retrySearch();
  }

  function searchNigerianSuggestion(dish) {
    updateFilters({ q: dish, mode: 'nigerian', cuisine: '', diet: '', intolerance: '', type: '' });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-[#E2F5E9] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#176B45]">Recipe discovery</p>
        <h1 className="mt-2 text-3xl font-black">{mode === 'ingredients' ? 'Find recipes by ingredients' : nigerianDiscovery ? 'Nigerian meal recipes' : initialCuisine ? `${initialCuisine} recipes` : 'Discover recipes'}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59635a]">Search TheMealDB for recipe information. Recipes are not CHI EATS menu inventory and cannot be purchased here.</p>
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Recipe search type">
          <button type="button" aria-pressed={mode === 'recipes'} onClick={() => updateFilters({ mode: 'recipes' })} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'recipes' ? 'bg-[#176B45] text-white' : 'bg-white text-[#202820]'}`}>Recipes and cuisine</button>
          <button type="button" aria-pressed={mode === 'ingredients'} onClick={() => updateFilters({ mode: 'ingredients' })} className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'ingredients' ? 'bg-[#176B45] text-white' : 'bg-white text-[#202820]'}`}>Search by ingredients</button>
        </div>
        <form onSubmit={submitSearch} className="mt-3 max-w-3xl">
          <div className="flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white p-2">
            <Search size={19} className="ml-2 shrink-0 text-[#777]" />
            <label htmlFor="recipe-search" className="sr-only">{mode === 'ingredients' ? 'Search by ingredients' : 'Search recipes'}</label>
            <input id="recipe-search" type="search" value={nigerianDiscovery && !search ? '' : query} onChange={(event) => updateFilters({ q: event.target.value, mode: nigerianDiscovery ? 'nigerian' : mode })} placeholder={mode === 'ingredients' ? 'Enter ingredients separated by commas' : nigerianDiscovery ? 'Search Nigerian dish names, e.g. egusi soup...' : 'Try chicken, jollof rice, pizza...'} className="min-w-0 flex-1 px-1 py-2 text-sm outline-none" />
            <button type="submit" className="rounded-lg bg-[#176B45] px-4 py-2.5 text-sm font-bold text-white">Search</button>
          </div>
          {nigerianDiscovery && <div className="mt-4">
            <p className="text-xs font-semibold text-[#59635a]">Popular Nigerian dish searches</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Nigerian dish suggestions">
              {NIGERIAN_DISH_SUGGESTIONS.map((dish) => <button type="button" key={dish} onClick={() => searchNigerianSuggestion(dish)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${search.toLocaleLowerCase() === dish.toLocaleLowerCase() ? 'border-[#176B45] bg-[#176B45] text-white' : 'border-[#d4e4d7] bg-white text-[#176B45] hover:bg-[#f4fbf6]'}`}>{dish}</button>)}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#667369]">Suggestions trigger real TheMealDB searches. Results are recipe matches, not verified Nigerian dishes or CHI EATS menu items.</p>
          </div>}
          {mode === 'recipes' && !nigerianDiscovery && <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1 text-xs font-semibold text-[#59635a]">Cuisine
              <select aria-label="Cuisine" value={cuisine} onChange={(event) => updateFilters({ cuisine: event.target.value })} className="rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#202820]">
                <option value="">All cuisines</option>
                {MEALDB_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-[#59635a]">Diet
              <select aria-label="Diet" value={diet} onChange={(event) => updateFilters({ diet: event.target.value })} className="rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#202820]">
                <option value="">Any diet</option>
                {DIETS.map((item) => <option key={item} value={item.toLowerCase()}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-[#59635a]">Exclude intolerance
              <select aria-label="Exclude intolerance" value={intolerance} onChange={(event) => updateFilters({ intolerance: event.target.value })} className="rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#202820]">
                <option value="">No exclusion</option>
                {INTOLERANCES.map((item) => <option key={item} value={item.toLowerCase()}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-[#59635a]">Meal type
              <select aria-label="Meal type" value={type} onChange={(event) => updateFilters({ type: event.target.value })} className="rounded-lg border border-[#E8E8E8] bg-white px-3 py-2 text-sm text-[#202820]">
                <option value="">Any meal type</option>
                {MEAL_TYPES.map((item) => <option key={item} value={item.toLowerCase()}>{item}</option>)}
              </select>
            </label>
          </div>}
        </form>
      </div>

      <div className="mt-7" aria-live="polite">
        {!loading && !error && !activeSearch && <EmptyState title={nigerianDiscovery ? 'Choose a Nigerian dish to search' : mode === 'ingredients' ? 'Add ingredients to search' : 'Start discovering recipes'} message={nigerianDiscovery ? 'Select a suggestion or enter a dish name. TheMealDB results will be shown only when the API returns a match.' : mode === 'ingredients' ? 'Enter one or more ingredients, separated by commas.' : 'Search for a dish or choose a cuisine, diet, or intolerance filter.'} />}
        {mode === 'recipes' && search.length === 1 && !cuisine && !diet && !intolerance && !type && <EmptyState title="Enter at least two characters" message="Recipe search starts when you enter two or more characters." />}
        {loading && <RecipeGrid recipes={[]} loading />}
        {!loading && error && <ErrorNotice message={error.message} onRetry={retrySearch} />}
        {!loading && !error && activeSearch && recipes.length === 0 && (
          <div className="space-y-4">
            {nigerianDiscovery && <p className="text-center text-sm font-semibold text-[#777]">0 TheMealDB recipes returned for “{search}”.</p>}
            <EmptyState title={mode === 'ingredients' ? 'No matching recipes found' : 'No recipes found'} message={nigerianDiscovery ? `No matching recipe was found in current TheMealDB results for “${search}”. Try another dish suggestion or alternate search term.` : mode === 'ingredients' ? 'TheMealDB returned no recipes for these ingredients. Try another ingredient list.' : `TheMealDB returned no recipes${search ? ` for “${search}”` : ''}. Try different search terms or filters.`} />
            {alternativeSearches.length > 0 && <div className="text-center">
              <p className="text-sm font-semibold text-[#59635a]">Try an alternate search term</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {alternativeSearches.map((term) => <button type="button" key={term} onClick={() => updateFilters({ q: term, mode: 'nigerian' })} className="rounded-full border border-[#176B45] bg-white px-4 py-2 text-sm font-semibold text-[#176B45] hover:bg-[#f4fbf6]">{term}</button>)}
              </div>
            </div>}
          </div>
        )}
        {!loading && !error && recipes.length > 0 && (
          <>
            <p className="mb-4 text-sm text-[#777]">{recipes.length} TheMealDB {recipes.length === 1 ? 'recipe' : 'recipes'} {nigerianDiscovery ? `matching “${search}”` : search ? `for “${search}”` : cuisine ? `in ${cuisine} cuisine` : mode === 'ingredients' ? 'for your ingredients' : ''}</p>
            <RecipeGrid recipes={recipes} />
          </>
        )}
      </div>
    </section>
  );
}
