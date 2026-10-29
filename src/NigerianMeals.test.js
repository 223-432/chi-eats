import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import App from './App';
import { clearNigerianFoodCache } from './services/nigerianFoodService';

const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'db.json'), 'utf8'));

beforeEach(() => {
  clearNigerianFoodCache();
  window.localStorage.clear();
  window.history.replaceState({}, '', '/category/6');
  global.fetch = jest.fn((input) => {
    if (input === '/db.json') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(catalog) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ meals: [] }) });
  });
});

test('legacy category 6 opens the Nigerian catalogue and category filters work', async () => {
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Nigerian meals' })).toBeInTheDocument();
  expect(await screen.findByText('36 foods')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Jollof Rice' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Egusi Soup' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Moi Moi' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Suya' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/db.json', expect.any(Object));

  fireEvent.change(screen.getByRole('combobox', { name: 'Food category' }), { target: { value: 'Soups' } });
  expect(await screen.findByText('10 foods')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Jollof Rice' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Egusi Soup' })).toBeInTheDocument();
});

test('local dishes remain searchable and visible when API fails', async () => {
  global.fetch.mockImplementation((input) => {
    if (input === '/db.json') return Promise.resolve({ ok: true, json: () => Promise.resolve(catalog) });
    return Promise.reject(new TypeError('Network unavailable'));
  });

  render(<App />);
  const search = await screen.findByRole('searchbox', { name: 'Search Nigerian foods' });
  fireEvent.change(search, { target: { value: 'Jollof Rice' } });

  expect(await screen.findByRole('link', { name: 'Jollof Rice' })).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent(/Unable to reach the recipe service/);
  expect(screen.getByRole('heading', { name: 'Local Nigerian food guides' })).toBeInTheDocument();
});

test('local Nigerian food favorites and meal plans retain stable namespaced IDs', async () => {
  render(<App />);
  const saveButton = await screen.findByRole('button', { name: 'Save Jollof Rice to favorites' });
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(window.localStorage.getItem('chi-eats-wishlist')).toBe('["ng-jollof-rice"]');
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add Jollof Rice to meal plan' }));
  await waitFor(() => {
    expect(window.localStorage.getItem('chi-eats-meal-plan')).toBe('["ng-jollof-rice"]');
  });

  fireEvent.click(screen.getByRole('link', { name: /Meal plan/ }));
  expect(await screen.findByRole('link', { name: 'Jollof Rice' })).toBeInTheDocument();
});

test('only researched Commons photos are used and their attribution appears on food details', async () => {
  const foods = catalog.nigerianFoods;
  const verified = foods.filter((food) => food.imageVerified);
  const unverified = foods.filter((food) => !food.imageVerified);
  expect(verified.length).toBeGreaterThan(0);
  expect(verified.every((food) => food.imageUrl.startsWith('https://upload.wikimedia.org/') || food.imageUrl.startsWith('https://thumb.wikimedia.org/'))).toBe(true);
  expect(unverified.every((food) => food.imageUrl === null)).toBe(true);

  window.history.replaceState({}, '', '/nigerian-foods/ng-egusi-soup');
  render(<App />);

  const egusiImage = await screen.findByAltText('Photograph of Egusi Soup');
  expect(egusiImage.getAttribute('src')).toContain('Egusi_soup_in_a_plate');
  expect(screen.getByRole('link', { name: 'Tesleemah' })).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:Egusi_soup_in_a_plate.jpg');
  expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0');
});
