const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const SEARCH_CACHE_TTL = 5 * 60 * 1000;
const DETAILS_CACHE_TTL = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 50;
const searchCache = new Map();
const detailsCache = new Map();
const pendingDetails = new Map();

export const MEALDB_AREAS = [
  'American',
  'British',
  'Canadian',
  'Chinese',
  'Croatian',
  'Dutch',
  'Egyptian',
  'French',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Kenyan',
  'Malaysian',
  'Mexican',
  'Moroccan',
  'Polish',
  'Portuguese',
  'Spanish',
  'Thai',
  'Tunisian',
  'Turkish',
  'Vietnamese',
];

export const NIGERIAN_DISH_SUGGESTIONS = [
  'Jollof rice',
  'Egusi soup',
  'Efo riro',
  'Okra soup',
  'Ogbono soup',
  'Afang soup',
  'Edikaikong soup',
  'Banga soup',
  'Oha soup',
  'Pepper soup',
  'Nigerian fried rice',
  'Moi moi',
  'Akara',
  'Puff puff',
  'Suya',
  'Nigerian meat pie',
  'Chin chin',
  'Ofada rice',
  'Beans and plantain',
  'Yam porridge',
  'Fufu',
  'Amala and ewedu',
  'Pounded yam',
  'Garri and soup',
  'Tuwo shinkafa',
];

const NIGERIAN_SEARCH_FALLBACKS = {
  'jollof rice': {
    alternateQueries: ['Rice', 'Chicken'],
    ingredients: ['rice', 'tomato'],
  },
  'egusi soup': {
    alternateQueries: ['Soup', 'Beef'],
    ingredients: ['beef', 'spinach'],
  },
  'moi moi': {
    alternateQueries: ['Beans'],
    ingredients: ['beans', 'onion'],
  },
  akara: {
    alternateQueries: ['Beans'],
    ingredients: ['beans'],
  },
  suya: {
    alternateQueries: ['Beef', 'Chicken'],
    ingredients: ['beef'],
  },
};

export function getNigerianSearchAlternatives(query) {
  const fallbacks = NIGERIAN_SEARCH_FALLBACKS[String(query || '').trim().toLocaleLowerCase()];
  return fallbacks ? fallbacks.alternateQueries : [];
}

export class RecipeServiceError extends Error {
  constructor(message, code = 'REQUEST_FAILED', status = 0) {
    super(message);
    this.name = 'RecipeServiceError';
    this.code = code;
    this.status = status;
  }
}

function cachedValue(cache, key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheValue(cache, key, value, ttl) {
  if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expiresAt: Date.now() + ttl });
}

export function normalizeRecipe(meal) {
  if (!meal || typeof meal !== 'object') return null;
  const id = Number(meal.idMeal);
  const title = typeof meal.strMeal === 'string' ? meal.strMeal.trim() : '';
  if (!Number.isSafeInteger(id) || id < 1 || !title) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    const ingStr = typeof ingredient === 'string' ? ingredient.trim() : '';
    if (!ingStr) continue;
    const measStr = typeof measure === 'string' ? measure.trim() : '';
    ingredients.push(measStr ? `${measStr} ${ingStr}` : ingStr);
  }

  const rawInstructions = typeof meal.strInstructions === 'string' ? meal.strInstructions.trim() : '';
  const instructions = rawInstructions
    ? rawInstructions.split(/\r?\n+/)
        .map((step) => step.replace(/^\d+[.)]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return {
    id,
    title,
    image: typeof meal.strMealThumb === 'string' && meal.strMealThumb.trim() ? meal.strMealThumb.trim() : null,
    imageAlt: `Photograph of ${title}`,
    summary: typeof meal.strTags === 'string' && meal.strTags.trim() ? `Tags: ${meal.strTags.split(',').join(', ')}` : (meal.strCategory ? `Category: ${meal.strCategory}` : ''),
    readyInMinutes: null,
    preparationMinutes: null,
    cookingMinutes: null,
    servings: null,
    diets: [],
    cuisines: meal.strArea ? [meal.strArea.trim()] : [],
    dishTypes: meal.strCategory ? [meal.strCategory.trim()] : [],
    intolerances: [],
    ingredients,
    instructions: instructions.length ? instructions : [rawInstructions].filter(Boolean),
    nutrition: [],
    sourceName: meal.strSource ? 'TheMealDB' : '',
    sourceUrl: safeSourceUrl(meal.strSource),
  };
}

function safeSourceUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

async function requestJson(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new RecipeServiceError('Unable to reach the recipe service. Check your connection and retry.', 'NETWORK_ERROR');
  }

  if (!response.ok) {
    throw new RecipeServiceError('Recipe data could not be loaded. Please try again.', 'REQUEST_FAILED', response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new RecipeServiceError('The recipe service returned invalid data. Please retry.', 'INVALID_RESPONSE', response.status);
  }
}

export async function searchRecipes(query, {
  signal,
  cuisine,
  diet,
  intolerances,
  type,
  number = 12,
  discovery = false,
} = {}) {
  const normalizedQuery = String(query || '').trim();
  if ((normalizedQuery.length === 1) || (!normalizedQuery && !cuisine && !diet && !intolerances && !type && !discovery)) return [];
  if (normalizedQuery.length > 100 || !Number.isInteger(number) || number < 1 || number > 50) {
    throw new RecipeServiceError('The recipe search filters are invalid.', 'INVALID_SEARCH', 400);
  }
  if (cuisine && !MEALDB_AREAS.includes(cuisine)) {
    throw new RecipeServiceError('That cuisine filter is not supported.', 'INVALID_CUISINE', 400);
  }

  const cacheKey = `search:${normalizedQuery.toLocaleLowerCase()}:${(cuisine || '').toLocaleLowerCase()}:${number}:${discovery}`;
  const cached = cachedValue(searchCache, cacheKey);
  if (cached) return cached;

  let data;
  if (cuisine) {
    data = await requestJson(`/filter.php?a=${encodeURIComponent(cuisine)}`, { signal });
  } else if (normalizedQuery) {
    data = await requestJson(`/search.php?s=${encodeURIComponent(normalizedQuery)}`, { signal });
  } else {
    data = await requestJson(`/search.php?f=a`, { signal });
  }

  const rawMeals = data && Array.isArray(data.meals) ? data.meals : [];
  let recipes = [];
  if (cuisine && rawMeals.length > 0) {
    const slice = rawMeals.slice(0, number);
    const detailPromises = slice.map((m) => requestJson(`/lookup.php?i=${m.idMeal}`, { signal }).catch(() => null));
    const detailResults = await Promise.all(detailPromises);
    recipes = detailResults.flatMap((res) => (res && Array.isArray(res.meals) ? res.meals.map(normalizeRecipe) : [])).filter(Boolean);
  } else {
    recipes = rawMeals.map(normalizeRecipe).filter(Boolean).slice(0, number);
  }

  cacheValue(searchCache, cacheKey, recipes, SEARCH_CACHE_TTL);
  return recipes;
}

export function getDiscoverRecipes(options = {}) {
  return searchRecipes('', { ...options, discovery: true });
}

export function searchRecipesByCuisine(cuisine, options = {}) {
  return searchRecipes('', { ...options, cuisine });
}

export async function searchRecipesByIngredients(ingredients, { signal, number = 12 } = {}) {
  const items = (Array.isArray(ingredients) ? ingredients : String(ingredients || '').split(','))
    .map((item) => String(item).trim())
    .filter(Boolean);
  const normalizedItems = [...new Set(items.map((item) => item.toLocaleLowerCase()))];
  if (!normalizedItems.length || normalizedItems.length > 10 ||
      normalizedItems.some((item) => item.length > 50) ||
      !Number.isInteger(number) || number < 1 || number > 50) {
    throw new RecipeServiceError('Enter between one and ten valid ingredients.', 'INVALID_INGREDIENTS', 400);
  }

  const primaryIngredient = normalizedItems[0];
  const key = `ingredients:${primaryIngredient}:${number}`;
  const cached = cachedValue(searchCache, key);
  if (cached) return cached;

  const data = await requestJson(`/filter.php?i=${encodeURIComponent(primaryIngredient)}`, { signal });
  const rawMeals = data && Array.isArray(data.meals) ? data.meals : [];
  const slice = rawMeals.slice(0, number);
  const detailPromises = slice.map((m) => requestJson(`/lookup.php?i=${m.idMeal}`, { signal }).catch(() => null));
  const detailResults = await Promise.all(detailPromises);
  const recipes = detailResults.flatMap((res) => (res && Array.isArray(res.meals) ? res.meals.map(normalizeRecipe) : [])).filter(Boolean);

  cacheValue(searchCache, key, recipes, SEARCH_CACHE_TTL);
  return recipes;
}

export async function searchNigerianRecipes(query, { signal, number = 12 } = {}) {
  const dish = String(query || '').trim();
  if (dish.length < 2 || dish.length > 100 || !Number.isInteger(number) || number < 1 || number > 50) {
    throw new RecipeServiceError('Enter a dish name and request between 1 and 50 recipes.', 'INVALID_SEARCH', 400);
  }

  const exactResults = await searchRecipes(dish, { signal, number });
  if (exactResults.length) return exactResults;

  const fallbacks = NIGERIAN_SEARCH_FALLBACKS[dish.toLocaleLowerCase()];
  if (!fallbacks) return exactResults;

  const results = [];
  for (const alternateQuery of fallbacks.alternateQueries) {
    results.push(...await searchRecipes(alternateQuery, { signal, number: Math.min(number, 6) }));
  }

  return [...new Map(results.map((recipe) => [recipe.id, recipe])).values()];
}

export async function getRecipeDetails(recipeId, { signal } = {}) {
  const id = Number(recipeId);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new RecipeServiceError('That recipe ID is invalid.', 'INVALID_RECIPE_ID', 400);
  }
  const key = String(id);
  const cached = cachedValue(detailsCache, key);
  if (cached) return cached;
  if (pendingDetails.has(key)) return pendingDetails.get(key);

  const request = requestJson(`/lookup.php?i=${id}`, { signal })
    .then((data) => {
      const meal = data && Array.isArray(data.meals) ? data.meals[0] : null;
      const recipe = normalizeRecipe(meal);
      if (!recipe) throw new RecipeServiceError('The recipe service returned invalid recipe data.', 'INVALID_RESPONSE');
      cacheValue(detailsCache, key, recipe, DETAILS_CACHE_TTL);
      return recipe;
    })
    .finally(() => pendingDetails.delete(key));
  pendingDetails.set(key, request);
  return request;
}

export async function getRecipeNutrition(recipeId, options) {
  const recipe = await getRecipeDetails(recipeId, options);
  return { servings: recipe.servings, nutrients: [] };
}
