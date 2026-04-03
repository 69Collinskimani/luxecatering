export async function GET() {
  try {
    // Use Anthropic to search and summarize trending Kenyan food news
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         process.env.ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
        }],
        messages: [{
          role:    "user",
          content: `Search for the latest trending food news, stories and topics in Kenya and East Africa in 2026. 
Find 6 recent stories about:
- Kenyan food industry news
- Local restaurant trends
- Traditional Kenyan cuisine revivals
- Food festivals and events in Nairobi
- Kenyan chef achievements
- Local food startups and innovations

Return ONLY a raw JSON array with no markdown. Each item:
{
  "id": "unique-slug",
  "title": "Article title",
  "excerpt": "2 sentence summary",
  "content": "3-4 paragraph detailed article",
  "category": "kenyan-cuisine|culture|recipes|tips",
  "author": "Source or Author name",
  "tags": ["tag1","tag2"],
  "date": "2026-03-16",
  "trending": true,
  "source_url": "url if available or null"
}`
        }],
      }),
    });

    const data = await res.json();
    const text = data.content?.filter(b => b.type === "text")?.map(b => b.text)?.join("") || "";
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) throw new Error("No news data returned");

    const news = JSON.parse(match[0]);
    return Response.json({ success: true, news, source: "live" });

  } catch (err) {
    console.error("food news error:", err);

    // Fallback to static trending topics
    return Response.json({
      success: true,
      source:  "fallback",
      news: [
        {
          id:       "nairobi-food-scene-2026",
          title:    "Nairobi's Food Scene Is Booming: Top Trends Reshaping Kenya's Dining Culture",
          excerpt:  "From rooftop nyama choma spots to upscale Swahili fusion restaurants, Nairobi's food scene has never been more exciting. Local chefs are blending tradition with innovation.",
          content:  "Nairobi's culinary landscape is undergoing a remarkable transformation in 2026. Young Kenyan chefs trained abroad are returning home with fresh techniques, applying them to beloved local ingredients like sukuma wiki, arrow roots, and pilau spices.\n\nThe city has seen a surge in farm-to-table restaurants that source directly from small-scale farmers in Kiambu, Nakuru, and the Rift Valley. This movement is not just about food — it's about supporting local agriculture and preserving traditional farming practices.\n\nFood festivals have become a cornerstone of Nairobi's social calendar, with events like the Nairobi Food & Wine Festival drawing thousands of visitors annually. These events celebrate the diversity of Kenyan cuisine while introducing international flavors.\n\nInvestment in the food sector has also increased significantly, with several Kenyan food startups securing funding to scale operations both locally and across East Africa.",
          category: "kenyan-cuisine",
          author:   "LuxeCatering Editorial",
          tags:     ["nairobi", "food trends", "2026", "restaurants"],
          date:     "2026-03-15",
          trending: true,
          source_url: null,
        },
        {
          id:       "kenyan-superfoods-global",
          title:    "Kenyan Superfoods Go Global: How Local Ingredients Are Conquering International Markets",
          excerpt:  "Ingredients like mursik, teff, and baobab fruit from Kenya are now appearing on menus in London, New York and Dubai. The world is finally waking up to East African nutrition.",
          content:  "Kenya's traditional foods are having a moment on the world stage. Ingredients that have nourished communities for generations are now being recognized for their extraordinary nutritional profiles by chefs and nutritionists globally.\n\nMursik, the fermented milk beloved by the Kalenjin community, has caught the attention of probiotic enthusiasts worldwide. Its unique fermentation process using a gourd treated with charcoal creates a flavor profile unlike any other fermented dairy product.\n\nBaobab fruit, long used in coastal Kenyan cooking, is now being marketed as a superfood powder in health food stores across Europe and North America. Rich in vitamin C and antioxidants, it's finding its way into smoothies and energy bars.\n\nThis global recognition is creating economic opportunities for Kenyan farmers and food producers, opening new export markets and driving investment in food processing infrastructure.",
          category: "culture",
          author:   "LuxeCatering Editorial",
          tags:     ["superfoods", "export", "global", "nutrition"],
          date:     "2026-03-14",
          trending: true,
          source_url: null,
        },
        {
          id:       "coastal-cuisine-revival",
          title:    "The Great Coastal Revival: Swahili Cuisine Finds Its Place in Fine Dining",
          excerpt:  "Mombasa's centuries-old Swahili cooking traditions are being elevated to fine dining status, with pilau, biriyani and coconut-based dishes appearing in high-end restaurants worldwide.",
          content:  "For centuries, Swahili cuisine has been one of Africa's most sophisticated culinary traditions — a beautiful fusion of Arab, Indian, and African influences developed along the East African coast. Now, it's finally getting the fine dining recognition it deserves.\n\nRestaurants in Mombasa, Malindi, and Lamu are reimagining classic dishes like kuku paka, samaki wa kupaka, and wali wa nazi with premium ingredients and refined presentations without losing their soul.\n\nChef Fatima Omar, recently awarded East Africa's Best Chef at the African Culinary Awards, has been instrumental in this revival. Her tasting menu at a Mombasa beachfront restaurant takes diners through 300 years of coastal culinary history in seven courses.\n\nThe revival has also sparked renewed interest in traditional cooking techniques, with cooking classes in historic coastal towns becoming popular tourist attractions.",
          category: "culture",
          author:   "LuxeCatering Editorial",
          tags:     ["swahili", "coastal", "mombasa", "fine dining"],
          date:     "2026-03-13",
          trending: true,
          source_url: null,
        },
        {
          id:       "kenyan-food-tech",
          title:    "FoodTech in Kenya: Startups Revolutionizing How We Grow, Cook and Deliver Food",
          excerpt:  "From AI-powered farming apps to drone food delivery in Nairobi, Kenyan food technology startups are attracting millions in investment and changing the food landscape.",
          content:  "Kenya's reputation as Africa's Silicon Savannah is extending into the food sector. A new wave of food technology startups is addressing challenges across the entire food value chain, from farm to fork.\n\nAgritech platforms are helping smallholder farmers in rural Kenya access market information, weather data, and financing through their phones. This is reducing post-harvest losses and improving incomes for millions of farming families.\n\nOn the consumer side, food delivery platforms have expanded beyond Nairobi to secondary cities like Mombasa, Kisumu, and Nakuru. Some startups are using electric motorbikes for delivery, addressing both the efficiency and environmental concerns.\n\nCloud kitchens — delivery-only restaurant concepts — have proliferated across Nairobi, allowing chefs to launch food businesses with lower overhead costs and experiment with innovative concepts.",
          category: "tips",
          author:   "LuxeCatering Editorial",
          tags:     ["foodtech", "startups", "innovation", "delivery"],
          date:     "2026-03-12",
          trending: true,
          source_url: null,
        },
        {
          id:       "nyama-choma-festival",
          title:    "Nairobi Nyama Choma Festival 2026: East Africa's Biggest BBQ Celebration Returns",
          excerpt:  "The annual Nyama Choma Festival is back, bigger than ever, celebrating Kenya's most beloved culinary tradition with over 50 vendors, live music, and cooking competitions.",
          content:  "The Nairobi Nyama Choma Festival returns this year with its biggest edition yet, expected to draw over 30,000 food lovers over three days at Uhuru Park. The festival celebrates Kenya's most beloved culinary tradition with a mix of traditional and contemporary takes on the beloved grilled meat dish.\n\nThis year's festival features a special competition for amateur cooks, with categories for best traditional nyama choma, most creative marinade, and best kachumbari accompaniment. The winners receive mentorship from professional chefs and a feature in a national food magazine.\n\nBeyond the meat, the festival showcases the full breadth of Kenyan street food, from viazi karai and mandazi to fresh sugarcane juice and traditional fermented beverages.\n\nLive performances from top Kenyan artists, cultural displays from different communities, and cooking demonstrations from celebrity chefs make this a full cultural celebration, not just a food event.",
          category: "kenyan-cuisine",
          author:   "LuxeCatering Editorial",
          tags:     ["festival", "nyama choma", "nairobi", "events"],
          date:     "2026-03-11",
          trending: true,
          source_url: null,
        },
        {
          id:       "traditional-recipes-preservation",
          title:    "Race Against Time: Documenting Kenya's Endangered Traditional Recipes",
          excerpt:  "Ethnobotanists and food historians are working to preserve hundreds of traditional Kenyan recipes at risk of being lost forever as older generations pass on.",
          content:  "In villages across Kenya, elderly women and men hold the keys to centuries of culinary wisdom — recipes, techniques, and food traditions that have never been written down and exist only in memory and practice. A growing movement of food historians, ethnobotanists, and passionate cooks is racing to document these traditions before they are lost forever.\n\nThe Kenya Traditional Foods Archive project has already documented over 400 recipes from 42 different communities, recording not just ingredients and methods but the cultural contexts, seasonal patterns, and ceremonial significance of each dish.\n\nMany of these recipes use indigenous vegetables and grains that are themselves endangered as monoculture farming expands. The documentation project has sparked a parallel effort to revive the cultivation of these indigenous crops.\n\nYoung Kenyan chefs are increasingly interested in these recovered recipes, incorporating ancient techniques and forgotten ingredients into contemporary menus that honor tradition while appealing to modern palates.",
          category: "culture",
          author:   "LuxeCatering Editorial",
          tags:     ["heritage", "traditional", "preservation", "culture"],
          date:     "2026-03-10",
          trending: false,
          source_url: null,
        },
      ],
    });
  }
}