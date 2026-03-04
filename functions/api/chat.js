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
            const apiKey = env.API_KEY_Aria; // Requires API_KEY_Aria to be set in Cloudflare secrets / Pages config
            const model = "gemma-3-27b-it";

            const systemPrompt = `You are Aria Concierge, the official AI assistant for ARIA, a premium Persian and Mediterranean restaurant in San Marcos, California. 

BUSINESS INFORMATION:
- Name: ARIA
- Location: 1650 Descanso Ave, San Marcos, CA 92078
- Hours: Monday to Sunday: 11:30 AM - 9:00 PM (Friday - Saturday: 11:30 AM - 9:30 PM)
- Phone (Reservations): +1 760-539-7890
- Phone (Catering): +1 858-400-0644
- Email: ariarestaurantsd@gmail.com
- Halal Status: 100% Halal-certified beef and chicken.
- Cuisine: Fine Persian & Mediterranean.
- Signature Dishes: Beef Koobideh, Chicken Soltani, saffron-infused rice, hummus, dolmeh.

KEY POLICIES:
- Reservations: Highy recommended, especially for weekends. Call +1 760-539-7890.
- Cancellations: Please notify at least 4 hours in advance. For large groups, 24-hour notice is appreciated.
- Dietary Needs: We offer gluten-free and vegetarian options. Inform your server of any allergies.
- Kids: Child-friendly options like mild kabobs and rice are available.
- Parking: Convenient parking in front on Descanso Ave and nearby street parking.

TONE:
- Elegant, professional, welcoming, and helpful.
- Keep responses relatively concise but informative.
- Reflect the "Quiet Luxury" atmosphere of the restaurant.

YOUR ROLE:
- Assist guests with reservations, menu questions, and general inquiries.
- If you can't answer a specific question, direct them to call us at +1 760-539-7890.`;

            // Using Google's Generative AI API (Gemma) via Cloudflare env
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
                            maxOutputTokens: 500,
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
