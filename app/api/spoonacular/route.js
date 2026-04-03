export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const params = new URLSearchParams()
  params.set("apiKey", process.env.SPOONACULAR_KEY)
  params.set("addRecipeInformation", "true")

  // Pass through all params from the frontend
  for (const [key, value] of searchParams.entries()) {
    params.set(key, value)
  }

  // Ensure number is set
  if (!params.has("number")) params.set("number", "9")

  try {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?${params}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    )
    if (!res.ok) {
      const err = await res.text()
      console.error("Spoonacular error:", err)
      return Response.json({ error: err }, { status: res.status })
    }
    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    console.error("Spoonacular fetch error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}