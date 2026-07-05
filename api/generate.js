export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    situationId,
    context,
    image,
    audience,
    tone,
    purpose,
    personName,
    personHandle,
    pastMessages,
    pastImage,
  } = req.body;

  // ── Audience descriptions ─────────────────────────────
  const AUDIENCE_DESC = {
    friend:    "a close friend they know well and are very comfortable with",
    crush:     "someone they have a crush on — be confident and naturally charming, not desperate or cringe",
    partner:   "their romantic partner / boyfriend / girlfriend / bae",
    family:    "a family member — warm and appropriate",
    stranger:  "someone they don't know well yet — friendly but not overly familiar",
    colleague: "a work colleague or classmate — professional but still friendly",
    group:     "a group chat with several people — make it inclusive and fun",
    ex:        "their ex — respectful, warm but not desperate or clingy",
    online:    "someone they met online — friendly, curious, not too forward",
    other:     "someone in their life — keep the tone warm and appropriate",
  };

  // ── Tone descriptions ─────────────────────────────────
  const TONE_DESC = {
    casual:      "Completely relaxed and natural, like texting a close mate. Everyday language, no formality at all.",
    romantic:    "Warm, heartfelt and genuinely sweet. Show real interest. Playful but sincere — not cringe or try-hard. Make it feel special.",
    funny:       "Playful and humorous. A witty observation or light joke that fits naturally. Make them laugh or at least smile.",
    uk_slang:    "Authentic British/UK street talk — words like \"fam\", \"innit\", \"bare\", \"peng\", \"wagwan\", \"you good\", \"mandem\", \"no cap\", \"it's giving\", \"bruv\", \"allow it\", \"on ones\" used naturally where they fit. NOT forced.",
    supportive:  "Warm, empathetic and genuinely caring. Acknowledge their feelings first before anything else. No preaching or empty positivity.",
    formal:      "Polite, respectful and clear. Slightly professional — good for people they want to impress or don't know well.",
    flirty:      "Playful, confident and lightly flirtatious. Keep them interested without being overwhelming. A little mystery goes a long way.",
    hype:        "High energy, enthusiastic and full of personality. The kind of message that immediately makes someone smile or feel good.",
    short:       "Very short and direct — one or two punchy sentences max. No filler, no fluff. Gets straight to the point.",
    real_talk:   "Honest and direct. No sugarcoating but still respectful. Say what actually needs to be said.",
    soft:        "Gentle, tender and sweet. Soft energy — careful with their feelings, warm without being overwhelming.",
    apologetic:  "Sincere and humble. Takes responsibility without overdoing it. Genuine, not dramatic.",
    // Post vibes
    hyped:       "Big energy and enthusiastic. Show real excitement and hype them up.",
    curious:     "Genuinely curious and interested. Ask about the detail or story behind it.",
    impressed:   "Genuinely impressed. Notice a specific detail and react to it authentically.",
    sweet:       "Warm, genuine and sweet. A heartfelt reaction that feels real.",
    // Chat openers
    smooth:      "Confident and smooth. Natural, not try-hard. The kind of opener that lands well.",
    compliment:  "Lead with a specific, genuine compliment that feels personal not generic.",
    check_in:    "Relaxed and casual. A low-pressure check-in that doesn't feel forced.",
    reconnect:   "Warm but natural. Acknowledge the time apart without making it awkward.",
    invite:      "Confident and direct. A bold invite that feels genuine not desperate.",
    // Reply styles
    comfort:     "Comforting and supportive. Acknowledge what they're going through first. Presence over advice.",
    bad_day:     "Empathetic and caring. They're having a hard time — acknowledge that genuinely.",
    good_news:   "Match their excited energy. Celebrate with them genuinely.",
    miss_you:    "Warm and genuine. Acknowledge the feeling without overdoing it.",
    conflict:    "Calm and mature. De-escalate without being dismissive of either side.",
    flirting:    "Playful and confident. Match their flirty energy without coming on too strong.",
    asking:      "Thoughtful and direct. Give a real answer that continues the conversation.",
    apologised:  "Warm and gracious. Accept genuinely without making them feel worse.",
  };

  // ── Purpose descriptions ──────────────────────────────
  const PURPOSE_DESC = {
    check_in:   "Just checking in on them naturally — not forced",
    compliment: "Giving them a genuine, specific compliment that feels real",
    apologize:  "Apologising sincerely — own it without being overdramatic",
    interest:   "Showing genuine interest in them and keeping the conversation going",
    comfort:    "Comforting or supporting them — presence over advice",
    invite:     "Inviting them somewhere or suggesting they hang out — confident not desperate",
    reconnect:  "Reconnecting after not talking for a while — natural, no awkward energy",
    respond:    "Replying directly and thoughtfully to what they said",
    react:      "Reacting authentically to what they posted",
    smooth:     "Opening smoothly and confidently",
    funny:      "Making them laugh or smile with a light, witty opener",
    // Message situations
    bad_day:    "They're going through something hard — acknowledge it genuinely and be there for them",
    good_news:  "They shared good news — celebrate with them and match their energy",
    miss_you:   "They said they miss you — respond with warmth and genuine feeling",
    conflict:   "There's tension — be calm, mature and de-escalate without being dismissive",
    flirting:   "They're flirting — match their playful energy confidently",
    casual:     "Normal casual conversation — keep it natural and light",
    asking:     "They asked you something — give a real, thoughtful answer",
    apologised: "They apologised — respond with warmth and grace",
  };

  const nameLine     = personName   ? `Their name is ${personName}.`                   : "";
  const handleLine   = personHandle ? `Their handle is @${personHandle}.`              : "";
  const audienceLine = AUDIENCE_DESC[audience] || AUDIENCE_DESC.friend;
  const toneLine     = TONE_DESC[tone]         || TONE_DESC.casual;
  const purposeLine  = PURPOSE_DESC[purpose]   || "Send a message that feels natural and genuine";

  // ── Past conversation context ─────────────────────────
  let pastSection = "";
  if (pastMessages && pastMessages.trim().length > 5) {
    pastSection = `

PREVIOUS CONVERSATION HISTORY — read this carefully:
---
${pastMessages.trim()}
---
Study the tone, dynamic, and what's already been said. Match the established vibe. Reference previous things naturally if it fits. Never repeat what was already said.`;
  }
  if (pastImage) {
    pastSection += `

The user has also uploaded a screenshot of their conversation. Use it to understand the relationship dynamic, tone, and context between them.`;
  }

  // ── Build prompt by situation ─────────────────────────
  let promptText = "";

  if (situationId === "reply_story") {
    promptText = `The user wants to reply to someone's social media story or post.

WHO they're messaging: ${audienceLine}
${nameLine} ${handleLine}
REACTION VIBE: ${toneLine}
GOAL: ${purposeLine}
${context ? `WHAT THE POST IS ABOUT: "${context}"` : "No description — reply based on what you see in the image."}
${pastSection}

${image ? "Look at the image carefully. Understand the mood, place, activity, or emotion shown." : ""}

Write a reply that:
— Responds directly and specifically to this post — not a generic reaction
— Sounds like something a real person would actually send
— Matches the reaction vibe and relationship type exactly
— If there is conversation history, stays consistent with how they already talk
${personName ? `— Use ${personName}'s name naturally if it fits` : ""}

Write as many sentences as naturally fits — usually 1 to 3. Never cut a thought short. Never end mid-sentence. Return ONLY the message text. No quotes. No explanation.`;

  } else if (situationId === "start_chat") {
    promptText = `The user wants to start a conversation with someone for the first time (or after a long time).

WHO they're messaging: ${audienceLine}
${nameLine} ${handleLine}
OPENER STYLE: ${toneLine}
GOAL: ${purposeLine}
${context ? `BACKGROUND / CONTEXT: "${context}"` : "No background — create a natural opener that works."}
${pastSection}

Write a conversation opener that:
— Feels completely natural and human — not copy-paste or AI-sounding
— Fits the opener style and relationship exactly
— If context was given, references it specifically so it feels personal
— If they have a name or handle, use it naturally if it fits
— Is the kind of message that actually gets a reply

Write as many sentences as the opener naturally needs. Never end mid-sentence. Return ONLY the message. No quotes. No explanation.`;

  } else {
    // reply_text
    promptText = `The user wants to reply to a message they received.

WHO sent it: ${audienceLine}
${nameLine} ${handleLine}
WHAT THEY SAID: "${context}"
THE SITUATION: ${purposeLine}
REPLY STYLE: ${toneLine}
${pastSection}

MOST IMPORTANT — read what they said and understand the full emotional weight:

— If it's difficult, sad, stressful or vulnerable (bad day, venting, feeling low, stressed, got in trouble, struggling) — FIRST genuinely acknowledge that specific feeling. Show you actually understood what they said. Be a real person who listened and cares. Do NOT be randomly cheerful. Do NOT use generic positive quotes. Be human.
— If it's exciting or happy — genuinely match that energy, celebrate with them
— If they're flirting — match their confidence and energy playfully
— If it's an apology — be warm and gracious without overdoing it
— If they asked something — give a real, thoughtful answer that continues the conversation
— If it's casual — keep it light, natural, and easy

THEN apply the requested reply style naturally on top of the emotional read.

If there is conversation history — stay consistent with the established dynamic. Build on what's already been said. Reference specific things if it's natural. Never repeat what was already said.

${personName ? `Use ${personName}'s name once if it fits naturally.` : ""}

Write a complete, genuine reply. Use as many sentences as the situation genuinely needs — don't cut it short. A supportive or emotional reply might need 4 to 6 sentences. A casual reply might only need 1 to 2. Match the length to what actually feels right. Never end mid-sentence. Never leave a thought unfinished.

Return ONLY the message text. No quotes around it. No explanation or preamble.`;
  }

  // ── Call Gemini ───────────────────────────────────────
  try {
    const parts = [];

    // Past chat screenshot first (context before prompt)
    if (pastImage) {
      const pastBase64 = pastImage.split(",")[1];
      const pastMime   = pastImage.split(";")[0].split(":")[1];
      parts.push({ inline_data: { mime_type: pastMime, data: pastBase64 } });
    }

    // Story/post image
    if (image && situationId === "reply_story") {
      const base64Data = image.split(",")[1];
      const mimeType   = image.split(";")[0].split(":")[1];
      parts.push({ inline_data: { mime_type: mimeType, data: base64Data } });
    }

    // Prompt always last
    parts.push({ text: promptText });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature:     1.0,
            topP:            0.95,
            topK:            40,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(500).json({ error: "AI request failed", details: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      console.error("Empty response from Gemini");
      return res.status(500).json({ error: "Empty response from AI" });
    }

    return res.status(200).json({ message: text });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
