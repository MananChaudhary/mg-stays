import Anthropic from "@anthropic-ai/sdk";
import type { Property } from "@/generated/prisma/client";
import {
  fetchNearbyPlacesContext,
  formatPlacesForAI,
  formatPlacesReply,
  isLocalDiscoveryQuery,
} from "./places";

function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export function buildPropertyContext(property: Property) {
  const faqs =
    property.faqs && typeof property.faqs === "object"
      ? JSON.stringify(property.faqs, null, 2)
      : "None provided";

  return `
Property: ${property.name}
Address: ${property.address}${property.city ? `, ${property.city}` : ""}${property.country ? `, ${property.country}` : ""}

Check-in Instructions:
${property.checkInInstructions || "Not specified"}

WiFi:
Network: ${property.wifiName || "Ask host"}
Password: ${property.wifiPassword || "Ask host"}

Parking:
${property.parkingInstructions || "Not specified"}

House Rules:
${property.houseRules || "Standard courtesy rules apply"}

Checkout Instructions:
${property.checkoutInstructions || "Not specified"}

Building Access:
${property.buildingAccess || "Not specified"}

Amenities: ${property.amenities.join(", ") || "None listed"}

Emergency Contacts:
${property.emergencyContacts || "Contact host via app"}

Local Recommendations (from host):
${property.localRecommendations || "None listed — use Google Maps nearby results when available"}

FAQs:
${faqs}
`.trim();
}

async function demoFallbackReply(property: Property, message: string) {
  const q = message.toLowerCase();

  if (q.includes("wifi") || q.includes("internet") || q.includes("password")) {
    return {
      content: property.wifiName
        ? `The WiFi network is "${property.wifiName}" and the password is "${property.wifiPassword}". Let me know if you have any trouble connecting!`
        : "WiFi details are in your stay guide above. If you need help, I can connect you with your host.",
      confidence: 0.9,
      escalated: false,
    };
  }

  if (q.includes("park")) {
    return {
      content:
        property.parkingInstructions ??
        "Please check the Parking section on your stay page, or contact your host.",
      confidence: 0.9,
      escalated: false,
    };
  }

  if (
    q.includes("check in") ||
    q.includes("check-in") ||
    q.includes("checkin") ||
    q.includes("arrive")
  ) {
    return {
      content: property.checkInInstructions ?? "Check-in details are in your stay guide above.",
      confidence: 0.9,
      escalated: false,
    };
  }

  if (q.includes("checkout") || q.includes("check out") || q.includes("leave")) {
    return {
      content: property.checkoutInstructions ?? "Checkout details are in your stay guide above.",
      confidence: 0.9,
      escalated: false,
    };
  }

  const { isCleaningComplaint, cleaningReplyForGuest } = await import("./cleaning-alerts");
  if (isCleaningComplaint(message)) {
    const hasTeam = !!(property.cleaningTeamEmail || property.cleaningTeamPhone);
    return {
      content: cleaningReplyForGuest(property.name, hasTeam),
      confidence: 0.95,
      escalated: true,
    };
  }

  if (isLocalDiscoveryQuery(message)) {
    const placesCtx = await fetchNearbyPlacesContext(property, message);
    if (placesCtx.places.length > 0) {
      const reply = formatPlacesReply(placesCtx.places, placesCtx.source);
      const hostTip = property.localRecommendations
        ? `\n\nYour host also recommends: ${property.localRecommendations}`
        : "";
      return {
        content: `${reply}${hostTip}`,
        confidence: placesCtx.source === "google" ? 0.88 : 0.75,
        escalated: false,
      };
    }
    if (property.localRecommendations) {
      return {
        content: `Here are some local tips from your host: ${property.localRecommendations}`,
        confidence: 0.8,
        escalated: false,
      };
    }
    return {
      content:
        "I'd recommend asking your host for their favourite nearby spots — they know the area best! You can also search on Google Maps around the property address.",
      confidence: 0.7,
      escalated: false,
    };
  }

  return {
    content:
      "Thanks for reaching out! Check your stay guide above for WiFi, parking, and check-in info. For anything else, your host can help directly.",
    confidence: 0.5,
    escalated: false,
  };
}

const SYSTEM_PROMPT = `You are the AI guest concierge for MG Stays, a premium hospitality platform.
Your role is to help guests during their stay with warmth, clarity, and professionalism.

Guidelines:
- Be friendly, natural, and hospitality-focused — never robotic
- Use the property information and any Google Maps nearby results provided below
- For WiFi, parking, check-in, checkout, and house rules — be specific and helpful
- When "Google Maps (live nearby search)" data is provided, recommend those places by name with ratings and walking/driving context; include the Maps link when available
- Prefer host "Local Recommendations" for personal favourites, and complement with Google results when both exist
- If you cannot answer confidently from the provided information, say you'll connect them with the host
- For urgent issues (safety, lockouts, emergencies), immediately escalate to the host
- Keep responses concise but warm — 2-4 sentences unless listing several places
- Never invent restaurant or café names that are not in the provided context`;

export async function generateGuestReply(
  property: Property,
  messages: { role: "user" | "assistant"; content: string }[],
  guestMessage: string
) {
  const placesCtx = await fetchNearbyPlacesContext(property, guestMessage);
  const placesBlock = formatPlacesForAI(placesCtx, property);

  const propertyContext = buildPropertyContext(property);
  const system = [
    SYSTEM_PROMPT,
    `\nProperty Information:\n${propertyContext}`,
    placesBlock ? `\n\n${placesBlock}` : "",
  ]
    .filter(Boolean)
    .join("");

  const anthropic = getAnthropic();
  if (!anthropic) {
    return demoFallbackReply(property, guestMessage);
  }

  if (typeof anthropic.messages?.create !== "function") {
    console.error("[ai] Anthropic SDK not loaded correctly in this environment");
    return demoFallbackReply(property, guestMessage);
  }

  const history = messages.slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 600,
      system,
      messages: [...history, { role: "user", content: guestMessage }],
    });

    const content =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "I'll connect you with your host for assistance.";

    const escalated =
      content.toLowerCase().includes("connect you with") ||
      content.toLowerCase().includes("host will") ||
      content.toLowerCase().includes("escalat");

    return {
      content,
      confidence: escalated ? 0.4 : placesCtx.source === "google" ? 0.9 : 0.85,
      escalated,
    };
  } catch {
    return demoFallbackReply(property, guestMessage);
  }
}
