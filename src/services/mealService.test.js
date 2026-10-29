import {
  getRecipeDetails,
  getDiscoverRecipes,
  getRecipeNutrition,
  getNigerianSearchAlternatives,
  normalizeRecipe,
  NIGERIAN_DISH_SUGGESTIONS,
  searchRecipes,
  searchNigerianRecipes,
  searchRecipesByCuisine,
  searchRecipesByIngredients,
} from './mealService';

beforeEach(() => {
  global.fetch = jest.fn();
});

test('normalizes documented meal details without fabricating missing fields', () => {
  const recipe = normalizeRecipe({
    idMeal: '123',
    strMeal: 'Jollof Rice',
    strTags: 'Rice,Spicy',
    strInstructions: '1. Cook the rice.\n2. Serve warm.',
    strIngredient1: 'rice',
    strMeasure1: '2 cups',
    strArea: 'Nigerian',
    strCategory: 'Chicken',
    strSource: 'https://example.test/recipe',
  });

  expect(recipe).toMatchObject({
    id: 123,
    title: 'Jollof Rice',
    ingredients: ['2 cups rice'],
    instructions: ['Cook the rice.', 'Serve warm.'],
    cuisines: ['Nigerian'],
    dishTypes: ['Chicken'],
    sourceUrl: 'https://example.test/recipe',
  });
  expect(recipe.image).toBeNull();
});

test('searches through TheMealDB and caches successful normalized results', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      meals: [{ idMeal: '91827', strMeal: 'Chicken stew', strMealThumb: 'https://img.example/chicken.jpg', strCategory: 'Chicken' }],
    }),
  });

  const first = await searchRecipes('test chicken query');
  const second = await searchRecipes('TEST CHICKEN QUERY');

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toContain('https://www.themealdb.com/api/json/v1/1/search.php?s=test%20chicken%20query');
  expect(first).toEqual(second);
  expect(first[0]).toMatchObject({ id: 91827, title: 'Chicken stew', image: 'https://img.example/chicken.jpg' });
});

test('discovers recipes through search without errors', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ meals: [{ idMeal: '91828', strMeal: 'Discovery recipe' }] }),
  });

  await expect(getDiscoverRecipes()).resolves.toMatchObject([{ id: 91828, title: 'Discovery recipe' }]);
  expect(global.fetch.mock.calls[0][0]).toContain('search.php?f=a');
});

test('uses cuisine and ingredient filter endpoints', async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ meals: [{ idMeal: '91829', strMeal: 'Cuisine recipe' }] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ meals: [{ idMeal: '91830', strMeal: 'Lookup recipe' }] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ meals: [{ idMeal: '91830', strMeal: 'Ingredient recipe', strIngredient1: 'rice', strMeasure1: '1 cup' }] }),
    });

  const cuisineResults = await searchRecipesByCuisine('Italian');
  expect(cuisineResults[0].title).toBe('Lookup recipe');
  expect(global.fetch.mock.calls[0][0]).toContain('filter.php?a=Italian');
});

test('Nigerian dish suggestions are search terms', () => {
  expect(NIGERIAN_DISH_SUGGESTIONS).toEqual(expect.arrayContaining([
    'Jollof rice',
    'Egusi soup',
    'Moi moi',
    'Suya',
    'Tuwo shinkafa',
  ]));
  expect(getNigerianSearchAlternatives('Egusi soup')).toEqual(['Soup', 'Beef']);
});

test('rejects invalid recipe IDs before making a request', async () => {
  await expect(getRecipeDetails('not-a-recipe')).rejects.toMatchObject({ code: 'INVALID_RECIPE_ID' });
  expect(global.fetch).not.toHaveBeenCalled();
});
