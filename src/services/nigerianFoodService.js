const CATALOG_URL = '/db.json';
let catalogCache = null;

function isFoodRecord(food) {
  if (!food || typeof food !== 'object') return false;
  const imageValid = food.imageVerified
    ? typeof food.imageUrl === 'string' &&
      /^https:\/\/(?:upload|thumb)\.wikimedia\.org\//.test(food.imageUrl) &&
      typeof food.imageSourceTitle === 'string' &&
      typeof food.imageSourceUrl === 'string' &&
      food.imageSourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:') &&
      typeof food.imageCredit === 'string' &&
      typeof food.imageLicense === 'string' &&
      typeof food.imageLicenseUrl === 'string' &&
      food.imageLicenseUrl.startsWith('https://creativecommons.org/licenses/')
    : food.imageUrl === null &&
      food.imageSourceTitle === null &&
      food.imageSourceUrl === null &&
      food.imageCredit === null &&
      food.imageLicense === null &&
      food.imageLicenseUrl === null;
  return typeof food.id === 'string' &&
    /^ng-[a-z0-9-]+$/.test(food.id) &&
    typeof food.name === 'string' &&
    typeof food.description === 'string' &&
    typeof food.category === 'string' &&
    typeof food.imageVerified === 'boolean' &&
    typeof food.imageAlt === 'string' &&
    imageValid &&
    Array.isArray(food.ingredients) &&
    food.ingredients.every((ingredient) => typeof ingredient === 'string') &&
    Array.isArray(food.instructions) &&
    food.instructions.every((instruction) => typeof instruction === 'string');
}

export async function getNigerianFoods({ signal } = {}) {
  if (catalogCache) return catalogCache;

  let response;
  try {
    response = await fetch(CATALOG_URL, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Unable to load the Nigerian food guide. Check your connection and retry.');
  }

  if (!response.ok) {
    throw new Error('The Nigerian food guide could not be loaded. Please retry.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('The Nigerian food guide returned invalid data. Please retry.');
  }

  if (!data || !Array.isArray(data.nigerianFoods) || data.nigerianFoods.some((food) => !isFoodRecord(food))) {
    throw new Error('The Nigerian food guide contains invalid records.');
  }

  catalogCache = data.nigerianFoods;
  return catalogCache;
}

export async function getNigerianFoodById(foodId, options) {
  const foods = await getNigerianFoods(options);
  return foods.find((food) => food.id === foodId) || null;
}

export function clearNigerianFoodCache() {
  catalogCache = null;
}
