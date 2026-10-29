import { useParams } from 'react-router-dom';
import RecipeSearch from './RecipeSearch';
import NigerianMeals from './NigerianMeals';

function cuisineLabel(slug) {
  return slug.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function CategoryProducts() {
  const { cuisine } = useParams();
  if (cuisine.toLowerCase() === 'nigerian') return <NigerianMeals />;
  return <RecipeSearch initialCuisine={cuisineLabel(cuisine)} />;
}
