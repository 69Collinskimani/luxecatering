import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request) {
  const recipe = await request.json()

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert([{
      name: recipe.name,
      category: recipe.category,
      cuisine: recipe.cuisine,
      time: recipe.time,
      servings: recipe.servings,
      emoji: recipe.emoji,
      difficulty: recipe.difficulty,
      is_vegetarian: recipe.isVegetarian,
      is_vegan: recipe.isVegan,
      tags: recipe.tags,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      source: recipe.source || 'ai'
    }])

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, data })
}
