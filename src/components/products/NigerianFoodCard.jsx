import { Heart, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import RecipeImage from './RecipeImage';

export default function NigerianFoodCard({ food, onRemove }) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const saved = wishlist.includes(food.id);
  const foodForImage = {
    title: food.name,
    image: food.imageVerified ? food.imageUrl : null,
    imageAlt: food.imageAlt,
    imageVerified: food.imageVerified,
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <Link to={`/nigerian-foods/${food.id}`} className="block" aria-label={`View food guide: ${food.name}`}>
          <RecipeImage recipe={foodForImage} className="aspect-[4/3] w-full object-cover" />
        </Link>
        {food.imageVerified && <p className="px-3 py-2 text-[11px] leading-4 text-[#777]">Photo: <a href={food.imageSourceUrl} target="_blank" rel="noreferrer" className="underline">{food.imageCredit}</a> · <a href={food.imageLicenseUrl} target="_blank" rel="noreferrer" className="underline">{food.imageLicense}</a></p>}
        <button
          type="button"
          onClick={() => toggleWishlist(food.id)}
          aria-label={saved ? `Remove ${food.name} from favorites` : `Save ${food.name} to favorites`}
          className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow ${saved ? 'text-rose-600' : 'text-[#202820]'}`}
        ><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[#176B45]">Nigerian food guide · informational</p>
        <Link to={`/nigerian-foods/${food.id}`} className="mt-1 block text-lg font-bold text-[#202820] hover:text-[#176B45]">{food.name}</Link>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-[#777]">{food.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#59635a]">
          <span className="rounded-full bg-[#E2F5E9] px-2.5 py-1">{food.category}</span>
          {food.preparationMinutes != null && <span className="rounded-full bg-[#FFF9F0] px-2.5 py-1">Prep: {food.preparationMinutes} min</span>}
          {food.cookingMinutes != null && <span className="rounded-full bg-[#FFF9F0] px-2.5 py-1">Cook: {food.cookingMinutes} min</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/nigerian-foods/${food.id}`} className="inline-flex rounded-lg bg-[#176B45] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#105437]">View food guide</Link>
          <button type="button" onClick={() => addToCart(food.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#176B45] px-3 py-2.5 text-sm font-bold text-[#176B45]" aria-label={`Add ${food.name} to meal plan`}><Plus size={15} /> Meal plan</button>
          {onRemove && <button type="button" onClick={() => onRemove(food.id)} className="inline-flex items-center gap-1 rounded-lg border border-[#E8E8E8] px-3 py-2.5 text-sm font-semibold text-[#777]" aria-label={`Remove ${food.name}`}><Trash2 size={15} /> Remove</button>}
        </div>
      </div>
    </article>
  );
}
