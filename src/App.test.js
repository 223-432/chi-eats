import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const recipeMeal = {
  idMeal: '1001',
  strMeal: 'A TheMealDB Recipe',
  strMealThumb: 'https://images.example.test/recipe.jpg',
  strTags: 'Recipe summary from the API.',
  strCategory: 'Main Course',
  strArea: 'Italian',
  strInstructions: 'Recipe instructions.',
  strIngredient1: 'Ingredient 1',
  strMeasure1: '1 cup',
};

const localFood = {
  id: 'ng-jollof-rice',
  name: 'Jollof Rice',
  description: 'A Nigerian rice dish.',
  category: 'Rice dishes',
  imageUrl: null,
  imageAlt: 'No verified photograph available for Jollof Rice',
  imageVerified: false,
  imageSourceTitle: null,
  imageSourceUrl: null,
  imageCredit: null,
  imageLicense: null,
  imageLicenseUrl: null,
  ingredients: [],
  instructions: [],
};

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, '', '/');
  global.fetch = jest.fn((input) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(String(input) === '/db.json'
      ? { nigerianFoods: [localFood] }
      : { meals: [recipeMeal] }),
  }));
});

test('home recipe cards are loaded through TheMealDB API', async () => {
  render(<App />);
  expect(await screen.findByText('A TheMealDB Recipe')).toBeInTheDocument();
  expect(global.fetch.mock.calls[0][0]).toContain('themealdb.com');
  expect(window.localStorage.getItem('chi-eats-cart')).toBeNull();
});

test('Nigerian discovery loads local guides and searches TheMealDB only after selection', async () => {
  window.history.replaceState({}, '', '/recipes?q=Nigerian');
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Nigerian meals' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Nigerian dish suggestions' }).querySelectorAll('button')).toHaveLength(25);
  expect(global.fetch.mock.calls.some(([url]) => url === '/db.json')).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: 'Jollof rice' }));
  expect(await screen.findByText('A TheMealDB Recipe')).toBeInTheDocument();
  await waitFor(() => expect(global.fetch.mock.calls.some(([url]) => String(url).includes('themealdb.com'))).toBe(true));
});

test('favorite recipe IDs persist locally without requiring product data', async () => {
  render(<App />);
  const favorite = await screen.findByRole('button', { name: 'Save A TheMealDB Recipe to favorites' });
  fireEvent.click(favorite);

  await waitFor(() => expect(window.localStorage.getItem('chi-eats-wishlist')).toBe('[1001]'));
  expect(await screen.findByRole('button', { name: 'Remove A TheMealDB Recipe from favorites' })).toBeInTheDocument();
});

test('checkout saves a recipe-only meal plan and does not create priced orders', async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Add A TheMealDB Recipe to meal plan' }));
  fireEvent.click(screen.getByRole('link', { name: /Meal plan/ }));
  fireEvent.click(await screen.findByRole('link', { name: 'Save meal plan' }));
  fireEvent.click(await screen.findByRole('link', { name: 'Create a demo account' }));

  await screen.findByRole('heading', { name: 'Create your account' });
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Diner' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'diner@example.test' } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'demo-pass-123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create demo account' }));

  await screen.findByRole('heading', { name: 'Review your recipes' });
  fireEvent.click(screen.getByRole('button', { name: 'Save meal plan on this device' }));
  await screen.findByRole('heading', { name: 'Meal plan saved' });

  const plans = JSON.parse(window.localStorage.getItem('chi-eats-meal-plans'));
  expect(plans[0].recipeIds).toEqual([1001]);
  expect(plans[0]).not.toHaveProperty('total');
  expect(plans[0]).not.toHaveProperty('price');
  expect(window.localStorage.getItem('chi-eats-meal-plan')).toBe('[]');
  expect(window.localStorage.getItem('chi-eats-orders')).toBeNull();
});

test('a network failure does not prevent recipe search from showing a retry state', async () => {
  window.history.replaceState({}, '', '/search?q=unreachable-recipe-search');
  global.fetch.mockRejectedValue(new TypeError('Network unavailable'));

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to reach the recipe service/);
  expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'CHI EATS home' })).toBeInTheDocument();
});
