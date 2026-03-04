export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        try {
            const { message } = await request.json();
            const apiKey = env.API_KEY_Aria;
            const model = "gemma-3-27b-it";

            const systemPrompt = `You are Aria, a friendly human concierge for ARIA, a fine Persian restaurant in San Marcos. 
Your goal is to provide quick, natural, and helpful answers. 

OUR MENU:
- Starters: Creamy Hummus, Dolmeh (stuffed grape leaves), and fresh Shirazi Salad.
- Signature Kabobs: Juicy Beef Koobideh and tender Chicken Soltani.
- Specialties: Slow-cooked Lamb Shank and Saffron-infused Basmati Rice.
- Desserts: Homemade Baklava and Saffron Ice Cream.
- We offer many vegetarian and gluten-free options. All meat is 100% Halal.

ESSENTIALS:
- Location: 1650 Descanso Ave, San Marcos.
- Hours: 11:30 AM - 9:00 PM (until 9:30 PM Fri/Sat).
- Reservations: +1 760-539-7890.

RULES:
1. If asked about the menu, mention specific items from each category above.
2. Use a warm, human tone (e.g., "Our Lamb Shank is a must-try!").
3. Keep responses extremely short (1-2 sentences).
4. ONLY answer what is asked.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        system_instruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        contents: [
                            { role: "user", parts: [{ text: message }] }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 150,
                        },
                    }),
                }
            );

            const data = await response.json();
            let aiText = "I apologize, but I'm having trouble connecting right now. Please call us at +1 760-539-7890 for immediate assistance.";

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                aiText = data.candidates[0].content.parts[0].text;
            }

            return new Response(JSON.stringify({ response: aiText }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        } catch (error) {
            console.error("Worker error:", error);
            return new Response(
                JSON.stringify({
                    response: "I'm experiencing technical difficulties. Please call us at +1 760-539-7890.",
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        }
    },
};
