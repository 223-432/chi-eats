import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function RecipeImage({ recipe, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [recipe.image]);
  if (!recipe.image || failed) {
    const message = recipe.imageVerified === false
      ? 'No verified photograph available'
      : failed
        ? 'Photo could not be loaded'
        : 'No recipe image available';
    return (
      <div className={`grid place-items-center gap-2 bg-[#f1f0eb] px-4 text-center text-sm font-semibold text-[#6b6b64] ${className}`} role="img" aria-label={`${message} for ${recipe.title}`}>
        <ImageOff size={25} aria-hidden="true" />
        <span>{message}</span>
      </div>
    );
  }
  return (
    <img
      src={recipe.image}
      alt={recipe.imageAlt || recipe.title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
