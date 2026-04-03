export async function POST(request) {
  try {
    const { type, payload } = await request.json();
    console.log("ai-chef request:", type, payload);

    const isChat        = type === "chat";
    const isDailyFusion = type === "daily_fusion";

    const prompts = {
      meal_suggestion: `You are a creative chef. The user has these ingredients: ${payload?.ingredients}.
Suggest 4 delicious meals they can make. Reply ONLY with a raw JSON array. No markdown. Each item:
{"name":"...","description":"1 sentence","difficulty":"Easy","time":"30 mins","matchScore":85,"missingIngredients":["salt"]}`,

      chat: `You are an expert AI chef assistant specializing in Kenyan and global cuisine.
Answer this cooking question warmly and concisely in 2-3 sentences: "${payload?.message}"
If relevant, mention a Kenyan twist or local ingredient.`,

      recommendations: `You are a food recommendation engine. Based on these recently viewed recipes: ${payload?.history?.join(", ")},
suggest 4 new recipes the user would love. Reply ONLY with a raw JSON array. No markdown. Each item:
{"name":"...","reason":"1 sentence why they'd like it","cuisine":"...","time":"30 mins","emoji":"🍽️","difficulty":"Easy","isVegetarian":false,"isVegan":false}`,

      daily_fusion: `Today is ${new Date().toDateString()}. Create 1 unique Kenyan fusion recipe blending traditional Kenyan ingredients with another world cuisine.
Reply ONLY with a raw JSON object. No markdown:
{"name":"...","fusionWith":"Italian","description":"2 exciting sentences","time":"45 mins","servings":"4 servings","difficulty":"Medium","emoji":"🍽️","ingredients":["1 cup ugali flour"],"instructions":"4-5 sentences","funFact":"interesting cultural fact"}`,

      dietary_analysis: `You are a nutritionist AI. Analyze this weekly meal log: ${JSON.stringify(payload?.meals)}.
Reply ONLY with a raw JSON object. No markdown:
{"score":75,"summary":"2 sentences","strengths":["strength 1","strength 2"],"improvements":["tip 1","tip 2"],"missingNutrients":["Iron","Vitamin C"],"recommendedRecipes":["Recipe 1","Recipe 2"],"weeklyTip":"1 actionable tip"}`
    };

    if (!prompts[type]) {
      return Response.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: isChat ? 300 : 1500,
        messages: [{ role: "user", content: prompts[type] }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic error:", err);
      const parsed = JSON.parse(err);
      const msg = parsed?.error?.message || err;
      const isCredits = msg.toLowerCase().includes("credit") || msg.toLowerCase().includes("billing");
      return Response.json({
        error: isCredits ? "credit_low" : `Anthropic error: ${res.status}`,
        message: msg
      }, { status: res.status });
    }

    const data = await res.json();
    console.log("Anthropic raw response:", JSON.stringify(data));

    const text = data.content?.filter(b => b.type === "text")?.map(b => b.text)?.join("") || "";

    if (!text) {
      console.error("Empty text from Anthropic:", data);
      return Response.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Chat — return plain text reply
    if (isChat) return Response.json({ reply: text.trim() });

    // All others — extract and parse JSON
    const match = text.match(/[\[{][\s\S]*[\]}]/);
    if (!match) {
      console.error("No JSON found in response:", text);
      return Response.json({ error: "AI returned invalid format", raw: text }, { status: 500 });
    }

    return Response.json(JSON.parse(match[0]));

  } catch (err) {
    console.error("ai-chef error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}