import { BrowserRouter, Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import SearchResults from './pages/SearchResults';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import Addresses from './pages/Addresses';
import { Login, Register } from './pages/Auth';
import { About, Contact, FAQ, PrivacyPolicy, Terms } from './pages/Information';
import NotFound from './pages/NotFound';
import RecipeSearch from './pages/RecipeSearch';
import RecipeDetails from './pages/RecipeDetails';
import CategoryProducts from './pages/CategoryProducts';
import NigerianFoodDetails from './pages/NigerianFoodDetails';
import NigerianMeals from './pages/NigerianMeals';

function ApplicationRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="cuisine/:cuisine" element={<CategoryProducts />} />
        <Route path="category/:categoryId" element={<LegacyCategoryRedirect />} />
        <Route path="products/:productId" element={<LegacyProductRedirect />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="recipes" element={<RecipeDiscoveryRoute />} />
        <Route path="recipes/:recipeId" element={<RecipeDetails />} />
        <Route path="nigerian-foods/:foodId" element={<NigerianFoodDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="addresses" element={<Addresses />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function RecipeDiscoveryRoute() {
  const [searchParams] = useSearchParams();
  return searchParams.get('q')?.trim().toLocaleLowerCase() === 'nigerian'
    ? <NigerianMeals />
    : <RecipeSearch />;
}

function LegacyProductRedirect() {
  const { productId } = useParams();
  return <Navigate to={`/recipes/${productId}`} replace />;
}

function LegacyCategoryRedirect() {
  const { categoryId } = useParams();
  return <Navigate to={categoryId === '6' ? '/cuisine/nigerian' : '/not-found'} replace />;
}

export default function App() {
  return <AppProvider><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><ApplicationRoutes /></BrowserRouter></AppProvider>;
}
