import { Clock3, Heart, Leaf, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import RecipeImage from './RecipeImage';

export default function RecipeCard({ recipe, onRemove }) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const saved = wishlist.includes(recipe.id);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Link to={`/recipes/${recipe.id}`} className="block" aria-label={`View recipe: ${recipe.title}`}>
          <RecipeImage recipe={recipe} className="aspect-[4/3] w-full object-cover" />
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(recipe.id)}
          aria-label={saved ? `Remove ${recipe.title} from favorites` : `Save ${recipe.title} to favorites`}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow ${saved ? 'text-rose-600' : 'text-[#202820]'}`}
        ><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#176B45]">TheMealDB recipe</p>
        <Link to={`/recipes/${recipe.id}`} className="mt-1 block text-lg font-bold text-[#202820] hover:text-[#176B45]">{recipe.title}</Link>
        {recipe.summary && <p className="mt-2 line-clamp-3 text-sm leading-5 text-[#777]">{recipe.summary}</p>}
        {!recipe.summary && recipe.ingredients.length > 0 && <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#777]">Ingredients: {recipe.ingredients.join(', ')}</p>}
        {(recipe.readyInMinutes !== null || recipe.diets.length > 0 || recipe.cuisines.length > 0 || recipe.dishTypes.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#59635a]">
            {recipe.readyInMinutes !== null && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF9F0] px-2.5 py-1"><Clock3 size={14} /> {recipe.readyInMinutes} min</span>}
            {recipe.diets.map((diet) => <span key={diet} className="inline-flex items-center gap-1 rounded-full bg-[#E2F5E9] px-2.5 py-1"><Leaf size={13} /> {diet}</span>)}
            {recipe.cuisines.map((cuisine) => <span key={cuisine} className="rounded-full bg-[#FFF9F0] px-2.5 py-1">{cuisine}</span>)}
            {recipe.dishTypes.slice(0, 2).map((type) => <span key={type} className="rounded-full bg-[#FFF9F0] px-2.5 py-1">{type}</span>)}
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/recipes/${recipe.id}`} className="inline-flex rounded-lg bg-[#176B45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#105437]">View recipe</Link>
          <button type="button" onClick={() => addToCart(recipe.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#176B45] px-3 py-2.5 text-sm font-bold text-[#176B45]" aria-label={`Add ${recipe.title} to meal plan`}><Plus size={15} /> Meal plan</button>
          {onRemove && <button type="button" onClick={() => onRemove(recipe.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E8] px-3 py-2.5 text-sm font-semibold text-[#777]" aria-label={`Remove ${recipe.title}`}><Trash2 size={15} /> Remove</button>}
        </div>
      </div>
    </article>
  );
}
