const { GoogleGenAI } = require("@google/genai");
const visitAnalyticsService = require("./visitAnalyticsService");
const aiChatUsageService = require("./aiChatUsageService");
const Store = require("../models/storeModel");

/**
 * Fetches all analytics data for a store in parallel.
 */
async function buildAnalyticsContext(storeId) {
  const [summary, segments, retention, lastVisitDist, store] = await Promise.all([
    visitAnalyticsService.getSummaryStats(storeId, null, null),
    visitAnalyticsService.getSegmentBreakdown(storeId),
    visitAnalyticsService.getRetentionData(storeId),
    visitAnalyticsService.getLastVisitDistribution(storeId),
    Store.findById(storeId).select("name").lean(),
  ]);

  return { summary, segments, retention, lastVisitDist, store };
}

/**
 * Builds the AI system prompt by injecting live analytics numbers.
 */
function buildSystemPrompt({ summary, segments, retention, lastVisitDist, store }) {
  const storeName = store?.name || "this store";

  const seg = segments || {};
  const fmtSeg = (key, label) => {
    const s = seg[key];
    if (!s) return `  - ${label}: 0 customers (0%)`;
    return `  - ${label}: ${s.count || 0} customers (${(s.percentage || 0).toFixed(1)}%)`;
  };

  const conv = retention?.conversionRates || {};
  const dist = lastVisitDist || {};
  const fmtDist = (key, label) => {
    const d = dist[key];
    return `  - ${label}: ${d?.count || 0} customers`;
  };

  return `You are a loyalty program analytics advisor for ${storeName}, a business using the Samparka loyalty platform.

Your job is to analyze their real-time store data and provide specific, actionable recommendations to improve customer retention, increase repeat visits, and drive upsells.

== STORE ANALYTICS SNAPSHOT ==
Total registered customers: ${summary?.totalRegisteredCustomers || 0}
Customers who have visited: ${summary?.totalCustomers || 0}
Total visits recorded: ${summary?.totalVisits || 0}
Repeat customer rate: ${(summary?.repeatRate || 0).toFixed(1)}%
Average visits per customer: ${(summary?.avgVisitsPerCustomer || 0).toFixed(1)}
Average days between visits: ${summary?.avgDaysBetweenVisits ? summary.avgDaysBetweenVisits.toFixed(0) + " days" : "N/A"}

At-risk customers (inactive 30+ days): ${summary?.atRiskCount || 0}
Active customers (visited last 30 days): ${summary?.activeCustomers || 0}
VIP customers (5+ visits): ${summary?.vipCustomers || 0}
One-time visitors: ${summary?.oneTimeVisitors || 0}

CUSTOMER SEGMENTS:
${fmtSeg("first_visit", "First-time visitors")}
${fmtSeg("second_visit", "Second-time visitors")}
${fmtSeg("third_visit", "Third-time visitors")}
${fmtSeg("fourth_visit", "Fourth-time visitors")}
${fmtSeg("5+_visits", "Loyal champions (5+ visits)")}

RETENTION FUNNEL:
  - 1st → 2nd visit conversion: ${(conv.visit1to2 || 0).toFixed(1)}%
  - 2nd → 3rd visit conversion: ${(conv.visit2to3 || 0).toFixed(1)}%
  - Churned customers (90+ days inactive): ${retention?.churnedCount || 0}

CUSTOMER RECENCY (last visit):
${fmtDist("7", "Visited within last 7 days")}
${fmtDist("30", "Visited 8–30 days ago")}
${fmtDist("60", "Visited 31–60 days ago")}
${fmtDist("90", "Visited 61–90 days ago")}
${fmtDist("120+", "Inactive 90+ days")}

== INSTRUCTIONS ==
- Always base your answers on the real numbers above.
- Be specific — reference actual customer counts and percentages.
- Keep responses concise (under 200 words) unless the user asks for detail.
- When recommending promotions, tailor them to the segment sizes shown.
- Do not fabricate data beyond this snapshot.
- Use a friendly, professional tone suitable for a small business owner.

== STRICT SCOPE LIMITATION ==
You are EXCLUSIVELY a loyalty program analytics advisor for ${storeName}.

YOU MUST ONLY answer questions about:
✅ ${storeName}'s customer data, visit patterns, and loyalty metrics shown above
✅ Strategies to improve customer retention, repeat visits, and engagement
✅ Marketing campaigns, promotions, and reward ideas for loyalty programs
✅ Customer segmentation and targeting based on the analytics
✅ How to use Samparka's loyalty features effectively

YOU MUST REFUSE to answer:
❌ Mathematical calculations or equations (e.g., "what is 2+2", "calculate 5*8")
❌ Homework, assignments, or academic questions
❌ General knowledge queries unrelated to ${storeName}
❌ Lists of businesses, competitors, or restaurants (e.g., "list QSR in Nepal")
❌ Recipes, cooking instructions, or personal advice
❌ Technical coding or programming questions
❌ Current events, politics, or news
❌ Any topic outside loyalty program analytics and marketing

If the user asks an off-topic question, politely redirect:
"I'm specifically designed to help analyze ${storeName}'s loyalty program data and suggest strategies to improve customer retention. I can help you understand your customer segments, identify at-risk customers, recommend promotions, or answer questions about the analytics shown above. How can I help with your loyalty program?"`;
}

/**
 * Sends the conversation to Gemini and returns the AI reply.
 * @param {Array<{role: string, text: string}>} messages - Full conversation history
 * @param {string} storeId - Store ID to fetch analytics for
 * @param {string} userId - User ID who is asking the question
 * @param {boolean} isAdmin - Whether the user is an admin (bypasses daily limit)
 */
async function getAIResponse(messages, storeId, userId = null, isAdmin = false) {
  // Check daily limit (admins bypass this)
  const limitCheck = await aiChatUsageService.checkDailyLimit(storeId, isAdmin);
  if (!limitCheck.allowed) {
    const resetTimeFormatted = limitCheck.resetTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    throw new Error(
      `DAILY_LIMIT_REACHED:${limitCheck.remaining}:${limitCheck.resetTime.toISOString()}:${resetTimeFormatted}`
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const ctx = await buildAnalyticsContext(storeId);
  const systemInstruction = buildSystemPrompt(ctx);

  // All messages except the last one go into chat history
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction },
    history,
  });

  const response = await chat.sendMessage({ message: lastMessage.text });

  // Increment usage after successful response (only if not admin)
  if (!isAdmin) {
    await aiChatUsageService.incrementUsage(storeId, lastMessage.text, userId, isAdmin);
  }

  return { reply: response.text };
}

async function getDailyLimitStatus(storeId, isAdmin = false) {
  const limitCheck = await aiChatUsageService.checkDailyLimit(storeId, isAdmin);
  return {
    allowed: limitCheck.allowed,
    remaining: limitCheck.remaining,
    used: limitCheck.used,
    resetTime: limitCheck.resetTime,
    timezone: limitCheck.timezone,
    isAdmin: limitCheck.isAdmin,
    dailyLimit: isAdmin ? null : 5,
  };
}

module.exports = { getAIResponse, getDailyLimitStatus };
