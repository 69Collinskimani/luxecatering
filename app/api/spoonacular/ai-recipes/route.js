export async function POST(request) {
  try {
    const { prompt, category } = await request.json()

    // Handle AI description enhancement
    const isDescriptionEnhance = prompt?.startsWith("enhance_description:")
    const cleanPrompt = isDescriptionEnhance ? prompt.replace("enhance_description:", "").trim() : prompt

    const content = isDescriptionEnhance
      ? `You are a professional food writer. Rewrite this recipe description to be warm, engaging, and appetizing for a food lover. Keep it under 3 sentences. Original: ${cleanPrompt}`
      : `Generate 9 recipes${cleanPrompt ? ` about "${cleanPrompt}"` : ""}${category && category !== "All" && category !== "description" ? ` in the ${category} category` : ""}.
Reply ONLY with a raw JSON array. No markdown, no explanation, no backticks.
Each item must follow this exact structure:
[{"id":1,"name":"Recipe Name","category":"Chicken","cuisine":"Italian","time":"30 mins","servings":"4 servings","emoji":"🍗","difficulty":"Easy","isVegetarian":false,"isVegan":false,"tags":["tag1","tag2"],"ingredients":["1 cup flour","2 eggs"],"instructions":"Step by step instructions in 3-4 sentences."}]`

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: isDescriptionEnhance ? 200 : 2000,
        messages: [{ role: "user", content }]
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Anthropic API error:", errText)
      return Response.json({ error: `Anthropic error: ${res.status}` }, { status: 500 })
    }

    const data = await res.json()
    console.log("Anthropic response:", JSON.stringify(data, null, 2))
    const text = data.content?.filter(b => b.type === "text")?.map(b => b.text || "")?.join("") || ""

    if (!text) return Response.json({ error: "Empty response from AI" }, { status: 500 })

    // Return plain text for description enhancement
    if (isDescriptionEnhance) return Response.json(text)

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return Response.json({ error: "Invalid AI response format" }, { status: 500 })

    return Response.json(JSON.parse(match[0]))
  } catch (err) {
    console.error("ai-recipes error:", err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}