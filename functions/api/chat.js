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

MENU HIGHLIGHTS:
- Signature Kabobs: Beef Koobideh and Chicken Soltani.
- Sides: Saffron-infused rice, Hummus, and Dolmeh.
- We offer many vegetarian and gluten-free options.

ESSENTIALS:
- 100% Halal certified.
- Location: 1650 Descanso Ave, San Marcos.
- Hours: 11:30 AM - 9:00 PM (until 9:30 PM Fri/Sat).
- Reservations: +1 760-539-7890.

RULES:
1. ONLY answer the specific question asked. Do not list other information unless relevant.
2. Use a warm, human tone (e.g., "We'd love to have you!" or "Our Koobideh is a guest favorite").
3. Keep responses extremely short (1-2 sentences).`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            { role: "user", parts: [{ text: systemPrompt }] },
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
                    response: "I'm experiencing technical difficulties. Please call us at +1 760-539-7890 or visit us at 1650 Descanso Ave.",
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
