import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { normalizeAddress, isValidEmail } from '../utils/validation';
import { readStorage, writeStorage } from '../utils/storage';

const AppContext = createContext(null);

function normalizeRecipeId(value) {
  if (typeof value === 'string' && /^ng-[a-z0-9-]+$/.test(value)) return value;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validRecipeIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(normalizeRecipeId).filter((id) => id !== null))];
}

function validMealPlans(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((plan) => plan && typeof plan.id === 'string' && typeof plan.createdAt === 'string')
    .map((plan) => ({ ...plan, recipeIds: validRecipeIds(plan.recipeIds) }));
}

export function AppProvider({ children }) {
  const [mealPlan, setMealPlan] = useState(() => validRecipeIds(readStorage('chi-eats-meal-plan', [])));
  const [wishlist, setWishlist] = useState(() => validRecipeIds(readStorage('chi-eats-wishlist', [])));
  const [mealPlans, setMealPlans] = useState(() => validMealPlans(readStorage('chi-eats-meal-plans', [])));
  const [user, setUser] = useState(() => readStorage('chi-eats-session', null));
  const [demoUsers, setDemoUsers] = useState(() => {
    const saved = readStorage('chi-eats-demo-users', []);
    return Array.isArray(saved) ? saved : [];
  });
  const [addresses, setAddresses] = useState(() => {
    const saved = readStorage('chi-eats-addresses', []);
    return Array.isArray(saved) ? saved : [];
  });
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      window.localStorage.removeItem('chi-eats-cart');
      window.localStorage.removeItem('chi-eats-orders');
    } catch (error) {
      console.error('Unable to remove obsolete demo order data from local storage.', error);
    }
  }, []);

  useEffect(() => writeStorage('chi-eats-meal-plan', mealPlan), [mealPlan]);
  useEffect(() => writeStorage('chi-eats-wishlist', wishlist), [wishlist]);
  useEffect(() => writeStorage('chi-eats-meal-plans', mealPlans), [mealPlans]);
  useEffect(() => writeStorage('chi-eats-session', user), [user]);
  useEffect(() => writeStorage('chi-eats-demo-users', demoUsers), [demoUsers]);
  useEffect(() => writeStorage('chi-eats-addresses', addresses), [addresses]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const addToCart = useCallback((recipeId) => {
    const id = normalizeRecipeId(recipeId);
    if (id === null) {
      notify('That recipe cannot be added to the meal plan.');
      return false;
    }
    setMealPlan((current) => current.includes(id) ? current : [...current, id]);
    notify('Recipe added to your meal plan.');
    return true;
  }, [notify]);

  const removeFromCart = useCallback((recipeId) => {
    const id = normalizeRecipeId(recipeId);
    setMealPlan((current) => current.filter((savedId) => savedId !== id));
  }, []);

  const toggleWishlist = useCallback((recipeId) => {
    const id = normalizeRecipeId(recipeId);
    if (id === null) return false;
    setWishlist((current) => (
      current.includes(id)
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    ));
    return true;
  }, []);

  const register = useCallback(({ name, email, password }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!String(name || '').trim() || !isValidEmail(normalizedEmail) || String(password || '').length < 6) {
      return { ok: false, message: 'Enter your name, a valid email, and a password of at least 6 characters.' };
    }
    if (demoUsers.some((item) => item.email === normalizedEmail)) {
      return { ok: false, message: 'An account with this email already exists. Please log in.' };
    }
    const profile = { id: `demo-${Date.now()}`, name: String(name).trim(), email: normalizedEmail };
    setDemoUsers((current) => [...current, profile]);
    setUser(profile);
    notify('Demo account created. No password was saved.');
    return { ok: true, user: profile };
  }, [demoUsers, notify]);

  const login = useCallback(({ email, password }) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!isValidEmail(normalizedEmail) || !password) {
      return { ok: false, message: 'Enter a valid email and password.' };
    }
    const profile = demoUsers.find((item) => item.email === normalizedEmail);
    if (!profile) return { ok: false, message: 'No demo account found for this email. Please register first.' };
    setUser(profile);
    notify('You are signed in to your demo account.');
    return { ok: true, user: profile };
  }, [demoUsers, notify]);

  const logout = useCallback(() => {
    setUser(null);
    notify('You have been signed out.');
  }, [notify]);

  const updateProfile = useCallback((updates) => {
    if (!user) return false;
    const nextUser = { ...user, name: String(updates.name || user.name).trim() };
    setUser(nextUser);
    setDemoUsers((current) => current.map((item) => item.id === user.id ? nextUser : item));
    return true;
  }, [user]);

  const saveAddress = useCallback((address) => {
    const next = normalizeAddress(address);
    if (!next.recipient || !next.phone || !next.street || !next.city) {
      return { ok: false, message: 'Complete the recipient, phone, street, and city fields.' };
    }
    setAddresses((current) => {
      const without = current.filter((item) => item.id !== next.id);
      if (next.isDefault || without.length === 0) {
        return [...without.map((item) => ({ ...item, isDefault: false })), { ...next, isDefault: true }];
      }
      return [...without, next];
    });
    return { ok: true, address: next };
  }, []);

  const deleteAddress = useCallback((id) => {
    setAddresses((current) => current.filter((address) => address.id !== id));
  }, []);

  const saveMealPlan = useCallback(() => {
    if (!user) return { ok: false, message: 'Please sign in to save a meal plan.' };
    if (!mealPlan.length) return { ok: false, message: 'Add at least one recipe to your meal plan.' };
    const plan = {
      id: `PLAN-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      recipeIds: [...mealPlan],
    };
    setMealPlans((current) => [plan, ...current]);
    setMealPlan([]);
    return { ok: true, plan };
  }, [mealPlan, user]);

  const removeMealPlan = useCallback((planId) => {
    setMealPlans((current) => current.filter((plan) => plan.id !== planId));
  }, []);

  const value = {
    mealPlan,
    mealPlans,
    cartCount: mealPlan.length,
    wishlist,
    user,
    addresses,
    toast,
    notify,
    addToCart,
    removeFromCart,
    toggleWishlist,
    register,
    login,
    logout,
    updateProfile,
    saveAddress,
    deleteAddress,
    saveMealPlan,
    removeMealPlan,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider.');
  return context;
}
