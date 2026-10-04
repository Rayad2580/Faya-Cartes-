export const config = {
  maxDuration: 60,
};

const MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";

function clean(value, fallback = "") {
  return String(value ?? fallback).trim().slice(0, 800);
}

function buildPrompt(card) {
  const occasion = clean(card.occasion, "Mariage");
  const name1 = clean(card.name1, "Aïcha");
  const name2 = clean(card.name2, "Moussa");
  const date = clean(card.date, "26 juillet 2026");
  const time = clean(card.time, "15H00");
  const location = clean(card.location, "Douala, Cameroun");
  const message = clean(card.message, "Votre présence sera un honneur et une grande joie pour nous.");
  const style = clean(card.style, "Bleu nuit, ivoire et or");
  const extra = clean(card.extra, "Luxueux, élégant, floral, oriental et chaleureux.");

  return `
Create a premium vertical digital invitation for a high-end French-speaking event design brand called Faya Cartes.

ART DIRECTION:
${style}
${extra}

The result must look like a professionally art-directed luxury invitation, NOT a website,
NOT a UI mockup, NOT a generic poster and NOT a simple CSS card.
Use rich editorial composition, sophisticated negative space, realistic paper/fabric texture,
fine metallic-gold ornamentation, elegant floral details, refined borders, subtle depth,
premium lighting and a coherent visual hierarchy.

FORMAT:
- Portrait vertical 2:3.
- Mobile-first invitation artwork.
- Professional finished graphic.
- No buttons, no browser frame, no app interface, no placeholder boxes.
- No watermark.
- No unrelated logo.

TYPOGRAPHY:
Use elegant French typography.
Make the names the main focal point with a refined calligraphic/script style.
Use a sophisticated serif or clean editorial font for supporting information.
Keep all text inside safe margins with excellent contrast and spacing.

TEXT — MUST BE DISPLAYED CLEARLY:
Occasion: ${occasion}
Names: ${name1} & ${name2}
Date: ${date}
Time: ${time}
Location: ${location}
Message: ${message}

TEXT ACCURACY:
- Preserve the supplied names, date, time, location and message exactly.
- Do not invent phone numbers, addresses, names or dates.
- Do not replace supplied text with gibberish.
- Do not add random paragraphs.
- Do not add technical labels.
- The supplied names must be clearly readable.

COMPOSITION:
Create a visually balanced premium invitation.
Top: tasteful decorative element and occasion heading.
Center: names large and elegant.
Lower center: date and time in a refined information block.
Lower section: location and message.
Decorative elements should frame the content rather than cover it.

Make the final result feel like a premium invitation someone would actually send on WhatsApp
or print for a ceremony.
`.trim();
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "Faya Cartes",
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: MODEL,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "La clé OpenAI n'est pas configurée dans Vercel.",
    });
  }

  try {
    const body = req.body || {};
    const prompt = buildPrompt(body);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size: "1024x1536",
        quality: "high",
      }),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(502).json({
        error: `OpenAI a renvoyé une réponse inattendue (HTTP ${response.status}).`,
      });
    }

    if (!response.ok) {
      const message =
        data?.error?.message ||
        `OpenAI a renvoyé HTTP ${response.status}.`;
      return res.status(response.status).json({ error: message });
    }

    const item = data?.data?.[0];
    if (!item) {
      return res.status(502).json({
        error: "OpenAI n'a pas renvoyé d'image.",
      });
    }

    if (item.b64_json) {
      return res.status(200).json({
        ok: true,
        image: `data:image/png;base64,${item.b64_json}`,
      });
    }

    if (item.url) {
      return res.status(200).json({
        ok: true,
        image: item.url,
      });
    }

    return res.status(502).json({
      error: "L'image a été générée mais son contenu est introuvable.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur pendant la génération. Réessaie dans quelques instants.",
    });
  }
}
