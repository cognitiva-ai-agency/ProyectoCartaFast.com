/**
 * Master list of ingredients for menu configuration
 * Organized by categories for easier management
 */

export const INGREDIENT_CATEGORIES = {
  CARNES: 'Carnes',
  PESCADOS: 'Pescados y Mariscos',
  VEGETALES: 'Vegetales',
  LACTEOS: 'Lácteos',
  CEREALES: 'Cereales y Granos',
  CONDIMENTOS: 'Condimentos y Especias',
  FRUTAS: 'Frutas',
  OTROS: 'Otros',
} as const

export type DietType = 'vegan' | 'vegetarian' | 'animal'

export interface Ingredient {
  id: string
  name: string
  category: keyof typeof INGREDIENT_CATEGORIES
  isCommonAllergen?: boolean
  image_url?: string
  dietType?: DietType
}

export const MASTER_INGREDIENTS: Ingredient[] = [
  // CARNES
  { id: 'carne-vacuno', name: 'Carne de Vacuno', category: 'CARNES', dietType: 'animal' },
  { id: 'carne-cerdo', name: 'Carne de Cerdo', category: 'CARNES', dietType: 'animal' },
  { id: 'pollo', name: 'Pollo', category: 'CARNES', dietType: 'animal' },
  { id: 'pavo', name: 'Pavo', category: 'CARNES', dietType: 'animal' },
  { id: 'cordero', name: 'Cordero', category: 'CARNES', dietType: 'animal' },
  { id: 'conejo', name: 'Conejo', category: 'CARNES', dietType: 'animal' },
  { id: 'jamon-iberico', name: 'Jamón Ibérico', category: 'CARNES', dietType: 'animal' },
  { id: 'jamon-serrano', name: 'Jamón Serrano', category: 'CARNES', dietType: 'animal' },
  { id: 'chorizo', name: 'Chorizo', category: 'CARNES', dietType: 'animal' },
  { id: 'salchicha', name: 'Salchicha', category: 'CARNES', dietType: 'animal' },

  // PESCADOS Y MARISCOS
  { id: 'salmon', name: 'Salmón', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'atun', name: 'Atún', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'lubina', name: 'Lubina', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'merluza', name: 'Merluza', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'bacalao', name: 'Bacalao', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'dorada', name: 'Dorada', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'camaron', name: 'Camarón', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'langostino', name: 'Langostino', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'calamar', name: 'Calamar', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'pulpo', name: 'Pulpo', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'mejillon', name: 'Mejillón', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },
  { id: 'almeja', name: 'Almeja', category: 'PESCADOS', isCommonAllergen: true, dietType: 'animal' },

  // VEGETALES
  { id: 'lechuga', name: 'Lechuga', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'tomate', name: 'Tomate', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'cebolla', name: 'Cebolla', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'ajo', name: 'Ajo', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'pimiento', name: 'Pimiento', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'aji', name: 'Ají', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'zanahoria', name: 'Zanahoria', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'papa', name: 'Papa', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'patata', name: 'Patata', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'berenjena', name: 'Berenjena', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'calabacin', name: 'Calabacín', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'espinaca', name: 'Espinaca', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'brocoli', name: 'Brócoli', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'coliflor', name: 'Coliflor', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'champiñon', name: 'Champiñón', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'setas', name: 'Setas', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'esparrago', name: 'Espárrago', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'aguacate', name: 'Aguacate', category: 'VEGETALES', dietType: 'vegan' },
  { id: 'judias-verdes', name: 'Judías Verdes', category: 'VEGETALES', dietType: 'vegan' },

  // LÁCTEOS
  { id: 'leche', name: 'Leche', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'nata', name: 'Nata', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'mantequilla', name: 'Mantequilla', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-manchego', name: 'Queso Manchego', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-parmesano', name: 'Queso Parmesano', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-mozzarella', name: 'Queso Mozzarella', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-azul', name: 'Queso Azul', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-cabra', name: 'Queso de Cabra', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'queso-crema', name: 'Queso Crema', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'mascarpone', name: 'Mascarpone', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'yogur', name: 'Yogur', category: 'LACTEOS', isCommonAllergen: true, dietType: 'vegetarian' },

  // CEREALES Y GRANOS
  { id: 'arroz', name: 'Arroz', category: 'CEREALES', dietType: 'vegan' },
  { id: 'arroz-arborio', name: 'Arroz Arborio', category: 'CEREALES', dietType: 'vegan' },
  { id: 'pasta', name: 'Pasta', category: 'CEREALES', isCommonAllergen: true, dietType: 'vegan' },
  { id: 'pan', name: 'Pan', category: 'CEREALES', isCommonAllergen: true, dietType: 'vegan' },
  { id: 'harina', name: 'Harina', category: 'CEREALES', isCommonAllergen: true, dietType: 'vegan' },
  { id: 'quinoa', name: 'Quinoa', category: 'CEREALES', dietType: 'vegan' },
  { id: 'avena', name: 'Avena', category: 'CEREALES', dietType: 'vegan' },
  { id: 'huevo', name: 'Huevo', category: 'CEREALES', isCommonAllergen: true, dietType: 'vegetarian' },

  // CONDIMENTOS Y ESPECIAS
  { id: 'aceite-oliva', name: 'Aceite de Oliva', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'vinagre', name: 'Vinagre', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'sal', name: 'Sal', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'pimienta', name: 'Pimienta', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'oregano', name: 'Orégano', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'albahaca', name: 'Albahaca', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'romero', name: 'Romero', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'tomillo', name: 'Tomillo', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'perejil', name: 'Perejil', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'cilantro', name: 'Cilantro', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'comino', name: 'Comino', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'paprika', name: 'Paprika', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'azafran', name: 'Azafrán', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'mostaza', name: 'Mostaza', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'salsa-soja', name: 'Salsa de Soja', category: 'CONDIMENTOS', dietType: 'vegan' },
  { id: 'mayonesa', name: 'Mayonesa', category: 'CONDIMENTOS', isCommonAllergen: true, dietType: 'vegetarian' },

  // FRUTAS
  { id: 'limon', name: 'Limón', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'naranja', name: 'Naranja', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'manzana', name: 'Manzana', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'fresa', name: 'Fresa', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'frutos-rojos', name: 'Frutos Rojos', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'higos', name: 'Higos', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'platano', name: 'Plátano', category: 'FRUTAS', dietType: 'vegan' },
  { id: 'uva', name: 'Uva', category: 'FRUTAS', dietType: 'vegan' },

  // OTROS
  { id: 'cafe', name: 'Café', category: 'OTROS', dietType: 'vegan' },
  { id: 'chocolate', name: 'Chocolate', category: 'OTROS' }, // Sin dietType - puede ser vegano o con leche
  { id: 'cacao', name: 'Cacao', category: 'OTROS', dietType: 'vegan' },
  { id: 'vainilla', name: 'Vainilla', category: 'OTROS', dietType: 'vegan' },
  { id: 'azucar', name: 'Azúcar', category: 'OTROS', dietType: 'vegan' },
  { id: 'miel', name: 'Miel', category: 'OTROS', dietType: 'vegetarian' },
  { id: 'trufa', name: 'Trufa', category: 'OTROS', dietType: 'vegan' },
  { id: 'agua', name: 'Agua', category: 'OTROS', dietType: 'vegan' },
  { id: 'vino-tinto', name: 'Vino Tinto', category: 'OTROS', dietType: 'vegan' },
  { id: 'vino-blanco', name: 'Vino Blanco', category: 'OTROS', dietType: 'vegan' },
  { id: 'cerveza', name: 'Cerveza', category: 'OTROS', dietType: 'vegan' },
  { id: 'bizcochos', name: 'Bizcochos', category: 'OTROS', isCommonAllergen: true, dietType: 'vegetarian' },
  { id: 'galletas', name: 'Galletas', category: 'OTROS', isCommonAllergen: true, dietType: 'vegetarian' },
]

// Helper functions
export function getIngredientById(id: string, customIngredients?: Ingredient[]): Ingredient | undefined {
  // First check in master ingredients
  const masterIngredient = MASTER_INGREDIENTS.find(ing => ing.id === id)
  if (masterIngredient) return masterIngredient

  // Then check in custom ingredients if provided
  if (customIngredients) {
    return customIngredients.find(ing => ing.id === id)
  }

  return undefined
}

export function getIngredientsByCategory(category: keyof typeof INGREDIENT_CATEGORIES, customIngredients?: Ingredient[]): Ingredient[] {
  const masterIngredients = MASTER_INGREDIENTS.filter(ing => ing.category === category)
  const customInCategory = customIngredients?.filter(ing => ing.category === category) || []
  return [...masterIngredients, ...customInCategory]
}

export function getAllIngredients(customIngredients?: Ingredient[]): Ingredient[] {
  return [...MASTER_INGREDIENTS, ...(customIngredients || [])]
}

export function getAllIngredientNames(customIngredients?: Ingredient[]): string[] {
  return getAllIngredients(customIngredients).map(ing => ing.name)
}

export function getIngredientNameById(id: string, customIngredients?: Ingredient[]): string {
  return getIngredientById(id, customIngredients)?.name || id
}

export function getIngredientIdByName(name: string, customIngredients?: Ingredient[]): string | undefined {
  const allIngredients = getAllIngredients(customIngredients)
  return allIngredients.find(ing => ing.name.toLowerCase() === name.toLowerCase())?.id
}

/**
 * Determines the dietary classification of a dish based on its ingredients
 * Returns 'vegan' if all ingredients are vegan
 * Returns 'vegetarian' if all ingredients are vegan or vegetarian
 * Returns null if the dish contains animal products
 */
export function getDishDietType(ingredientIds: string[], allIngredients: Ingredient[]): 'vegan' | 'vegetarian' | null {
  if (!ingredientIds || ingredientIds.length === 0) return null

  const dishIngredients = ingredientIds
    .map(id => allIngredients.find(ing => ing.id === id))
    .filter((ing): ing is Ingredient => ing !== undefined)

  if (dishIngredients.length === 0) return null

  // Check if all ingredients have a dietType defined
  const hasAllDietTypes = dishIngredients.every(ing => ing.dietType)
  if (!hasAllDietTypes) return null

  // If any ingredient is animal, the dish is not vegan or vegetarian
  const hasAnimal = dishIngredients.some(ing => ing.dietType === 'animal')
  if (hasAnimal) return null

  // If all ingredients are vegan, the dish is vegan
  const allVegan = dishIngredients.every(ing => ing.dietType === 'vegan')
  if (allVegan) return 'vegan'

  // Otherwise, if it has vegetarian ingredients, it's vegetarian
  return 'vegetarian'
}
