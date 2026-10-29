# CHI EATS

CHI EATS is a React recipe-discovery and meal-planning application powered by TheMealDB API. Recipe names, images, ingredients, cooking instructions, and cuisine areas come from TheMealDB. The app does not sell food or provide restaurant inventory, grocery stock, pricing, delivery, or payments.

## Local setup

Use Node.js 18 or later. Install dependencies and start the app:

```powershell
npm install
npm start
```

The frontend runs on port 3000 and connects directly to TheMealDB public API (`https://www.themealdb.com/api/json/v1/1/`).

## TheMealDB operations

- Recipe search uses `GET search.php?s=NAME`.
- Cuisine/area filtering uses `GET filter.php?a=AREA`.
- Ingredient filtering uses `GET filter.php?i=INGREDIENT`.
- Recipe details use `GET lookup.php?i=MEAL_ID`.
- Categories use `GET categories.php`.

## Nigerian food guide

The local Nigerian recipe guide is `public/db.json`. Create React App copies it to the build output unchanged, so the app loads it from `/db.json` in development and production. The guide is independent of external API availability and includes recipe instructions and ingredient lists; nutrition is omitted because it has not been verified. Local guides are not CHI EATS restaurant inventory, prices, or delivery offers.

Open `/cuisine/nigerian` or the legacy `/category/6` route to browse it. Search and category filters operate on the local catalogue, while external TheMealDB matches appear separately when a query is entered. Favorites and meal plans store local guide IDs with an `ng-` prefix, distinct from numeric TheMealDB IDs.

## Favorites and meal planning

Favorites, a draft recipe meal plan, saved meal plans, demo profile details, and optional saved contact addresses are stored in this browser. Meal plans contain recipe IDs only and never store invented prices or order details. Demo authentication remains local and is not secure server authentication.

## Validation

```powershell
npm test -- --watchAll=false
npm run build
```
