import { createServerFn } from "@tanstack/react-start";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export const askPlantDoctor = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatTurn[]; context?: string; lang?: string }) => {
    if (!Array.isArray(input?.messages) || input.messages.length === 0) {
      throw new Error("Please type a question.");
    }
    return {
      messages: input.messages.slice(-12).map((turn) => ({
        role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(turn.content ?? "").slice(0, 2000),
      })),
      context: typeof input.context === "string" ? input.context.slice(0, 2000) : "",
      lang: input.lang === "bn" || input.lang === "hi" ? input.lang : "en",
    };
  })
  .handler(async ({ data }) => {
    const language =
      data.lang === "bn" ? "Bangla" : data.lang === "hi" ? "Hindi" : "very simple English";

    const system = `You are a friendly plant doctor for small farmers. Answer in ${language}.
Use short sentences and simple words. Give practical steps. Keep answers under 120 words.
Always say to ask a local expert before using strong chemicals.
${data.context ? `The farmer's last scan result: ${data.context}` : "There is no scan result yet."}`;

    try {
      const { callGateway } = await import("./ai-gateway.server");
      const reply = await callGateway([{ role: "system", content: system }, ...data.messages]);
      return { reply: reply.trim() || "Sorry, I could not answer that. Please ask again." };
    } catch {
      const lastMsg = (data.messages[data.messages.length - 1]?.content || "").toLowerCase();
      let fallback = "";
      if (lastMsg.includes("yellow") || lastMsg.includes("হলুদ") || lastMsg.includes("पील")) {
        fallback =
          data.lang === "bn"
            ? "পাতা হলুদ হওয়ার সাধারণ কারণ হলো নাইট্রোজেন বা পুষ্টির ঘাটতি, অতিরিক্ত পানি বা শিকড়ের সমস্যা। শিকড়ে পানি যাতে না জমে তা নিশ্চিত করুন এবং সুষম জৈব সার প্রয়োগ করুন।"
            : data.lang === "hi"
              ? "पत्तियों के पीले होने का मुख्य कारण नाइट्रोजन या पोषक तत्वों की कमी अथवा अत्यधिक पानी हो सकता है। जल निकासी ठीक करें और संतुलित खाद दें।"
              : "Yellow leaves usually indicate nitrogen shortage or overwatering. Ensure proper soil drainage and apply balanced organic compost. Water directly at the root zone.";
      } else if (
        lastMsg.includes("treat") ||
        lastMsg.includes("cure") ||
        lastMsg.includes("spray") ||
        lastMsg.includes("চিকিৎসা") ||
        lastMsg.includes("ইলাজ")
      ) {
        fallback =
          data.lang === "bn"
            ? "আক্রান্ত পাতাগুলো সাবধানে কেটে দূরবর্তী স্থানে নষ্ট করে ফেলুন। বিকেলে নিম তেলের স্প্রে দিন এবং মাটিতে পানি দিন, পাতায় নয়।"
            : data.lang === "hi"
              ? "प्रभावित पत्तियों को तुरंत हटा दें। शाम के समय नीम के तेल का छिड़काव करें और केवल जड़ों में पानी दें।"
              : "Prune and dispose of infected leaves away from your crop. Spray organic neem oil in the evening and water directly at the soil base rather than over the foliage.";
      } else if (
        lastMsg.includes("spread") ||
        lastMsg.includes("ছড়ায়") ||
        lastMsg.includes("ফैल")
      ) {
        fallback =
          data.lang === "bn"
            ? "হ্যাঁ, আর্দ্র আবহাওয়া ও পানির ছিটার মাধ্যমে রোগটি অন্য পাতায় ছড়াতে পারে। গাছগুলোর মাঝে পর্যাপ্ত ফাঁকা জায়গা রাখুন।"
            : data.lang === "hi"
              ? "हाँ, नमी और पानी के छींटों से रोग अन्य पत्तियों में फैल सकता है। पौधों के बीच पर्याप्त दूरी बनाए रखें।"
              : "Yes, fungal spores can spread rapidly via water splashes and high humidity. Keep plants properly spaced for ventilation and keep the canopy dry.";
      } else {
        fallback =
          data.lang === "bn"
            ? "আপনার ফসলের পরিচর্যায় গাছের গোড়ায় নিয়মিত পরিমিত পানি দিন এবং রোগাক্রান্ত অংশ অপসারণ করুন। সুনির্দিষ্ট রাসায়নিক ব্যবহারের পূর্বে স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।"
            : data.lang === "hi"
              ? "फसल की उचित देखभाल के लिए प्रभावित भागों को हटाएँ और पर्याप्त धूप व हवा सुनिश्चित करें। किसी भी दवा के प्रयोग से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।"
              : "Ensure good plant spacing for air circulation, avoid wet leaves overnight, and remove any heavily spotted foliage. Consult a local extension officer before applying chemical sprays.";
      }
      return { reply: fallback };
    }
  });
