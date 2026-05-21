"use strict";

const axios = require("axios");
const sharp = require("sharp");
const vision = require("@google-cloud/vision");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");

// Initialize Google Vision client (singleton)
let googleVisionClient = null;
const initGoogleVisionClient = () => {
  if (googleVisionClient) return googleVisionClient;
  
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
    path.join(__dirname, "../config/credentials/google-vision-service-account.json");
  
  try {
    googleVisionClient = new vision.ImageAnnotatorClient({
      keyFilename: credentialsPath,
    });
    console.log(`✅ [Google Vision] Service account initialized from ${credentialsPath}`);
    return googleVisionClient;
  } catch (error) {
    console.error(`❌ [Google Vision] Failed to initialize client: ${error.message}`);
    throw new Error(`Google Vision SDK initialization failed: ${error.message}`);
  }
};

/**
 * OCR Provider: OpenAI GPT-4o Vision
 * Selected when OCR_PROVIDER=openai (the default)
 */
const openAIProvider = {
  name: "openai",
  async extract(buffer, mimeType) {
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a receipt data extractor. Extract structured data from this receipt image and return ONLY valid JSON with exactly these fields:
{
  "receiptNumber": string or null,
  "receiptDate": ISO date string (YYYY-MM-DD) or null,
  "storeName": string or null,
  "totalAmount": number or null,
  "items": array of { "name": string, "quantity": number, "price": number } or empty array,
  "confidence": number between 0 and 1 indicating your confidence in the extraction accuracy
}
Return ONLY the JSON object. No explanation, no markdown, no code blocks.`,
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const text = response.data.choices[0].message.content.trim();
    const data = JSON.parse(text);
    data.ocrProvider = "openai";
    return data;
  },
};

/**
 * OCR Provider: Google Cloud Vision API
 * Uses Document Text Detection with service account authentication
 */
const googleVisionProvider = {
  name: "google_vision",
  async extract(buffer, _mimeType) {
    const client = initGoogleVisionClient();

    // Compress image before sending to Google Vision API (max 1.5MB recommended)
    // Resize to max 1500px width/height, 85% JPEG quality
    const originalKB = Math.round(buffer.length / 1024);
    const compressed = await sharp(buffer)
      .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const compressedKB = Math.round(compressed.length / 1024);
    console.log(`🔍 [Google Vision] Starting OCR extraction (image: ${originalKB} KB → ${compressedKB} KB after compression)`);
    
    const start = Date.now();

    try {
      // Call Google Vision API using official SDK
      const [result] = await client.documentTextDetection(compressed);
      
      const elapsed = Date.now() - start;
      console.log(`✅ [Google Vision] API responded in ${elapsed}ms`);

      if (!result || !result.fullTextAnnotation) {
        console.warn(`⚠️ [Google Vision] No text detected in image`);
        return {
          receiptNumber: null,
          receiptDate: null,
          storeName: null,
          totalAmount: null,
          totalCandidates: [],
          items: [],
          rawText: "",
          confidence: 0.1,
          ocrProvider: "google_vision",
        };
      }

      // Extract full text from fullTextAnnotation
      const fullText = result.fullTextAnnotation.text || "";
      
      if (!fullText) {
        console.warn(`⚠️ [Google Vision] Empty text annotation`);
        return {
          receiptNumber: null,
          receiptDate: null,
          storeName: null,
          totalAmount: null,
          totalCandidates: [],
          items: [],
          rawText: "",
          confidence: 0.1,
          ocrProvider: "google_vision",
        };
      }

      console.log(`✅ [Google Vision] Extracted ${fullText.split("\n").length} lines of text`);
      console.log(`📝 [Google Vision] Parsing receipt fields using regex...`);

      // Use the same parseReceiptText function that PaddleOCR uses
      const parsed = parseReceiptText(fullText);

      console.log(`✅ [Google Vision] Parse complete: confidence=${parsed.confidence}, total=${parsed.totalAmount}, date=${parsed.receiptDate}`);
      if (parsed.totalCandidates?.length) {
        console.log(`📊 [Google Vision] Total candidates: ${parsed.totalCandidates.map((c) => `${c.label}=${c.amount}`).join(" | ")}`);
      }

      return {
        receiptNumber: parsed.receiptNumber,
        receiptDate: parsed.receiptDate,
        storeName: parsed.storeName,
        totalAmount: parsed.totalAmount,
        totalCandidates: parsed.totalCandidates || [],
        items: parsed.items,
        rawText: fullText,
        confidence: parsed.confidence,
        ocrProvider: "google_vision",
      };
    } catch (error) {
      const elapsed = Date.now() - start;
      console.error(`❌ [Google Vision] Request failed after ${elapsed}ms:`, error.message);
      
      // Handle Google Cloud SDK error codes
      // https://cloud.google.com/apis/design/errors
      if (error.code === 7) {
        throw new Error(`Google Vision API: Permission denied. Ensure the service account has "Cloud Vision API User" role and the API is enabled.`);
      } else if (error.code === 3) {
        throw new Error(`Google Vision API: Invalid image format or corrupted data`);
      } else if (error.code === 8) {
        throw new Error(`Google Vision API: Quota exceeded. Check your billing and quota limits.`);
      } else if (error.code === 16) {
        throw new Error(`Google Vision API: Authentication failed. Verify service account credentials are valid.`);
      } else if (error.code === 14) {
        throw new Error(`Google Vision API: Service unavailable. Try again later.`);
      } else {
        throw new Error(`Google Vision API error (code ${error.code || "unknown"}): ${error.message}`);
      }
    }
  },
};

/**
 * OCR Provider: AWS Textract (placeholder for future use)
 */
const awsTextractProvider = {
  name: "aws_textract",
  async extract(_buffer, _mimeType) {
    throw new Error("AWS Textract provider not yet implemented");
  },
};

/**
 * OCR Provider: Google Gemini 2.5 Flash-Lite
 * Uses vision capabilities of gemini-2.5-flash-lite to extract structured receipt data.
 * Thinking is disabled (thinkingBudget: 0) for faster structured extraction responses.
 */
const geminiProvider = {
  name: "gemini",
  async extract(buffer, _mimeType) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Compress image before sending — reduces payload size and speeds up upload
    const originalKB = Math.round(buffer.length / 1024);
    const compressed = await sharp(buffer)
      .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    const compressedKB = Math.round(compressed.length / 1024);
    console.log(`🤖 [Gemini] Starting OCR extraction (image: ${originalKB} KB → ${compressedKB} KB after compression)`);

    const base64 = compressed.toString("base64");
    const start = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      config: {
        // Disable thinking for fast structured extraction — no reasoning needed
        thinkingConfig: { thinkingBudget: 0 },
      },
      contents: [
        {
          parts: [
            {
              text: `You are a receipt OCR extractor. Carefully read the receipt image and extract the following fields. Return ONLY a valid JSON object with no explanation, no markdown, no code blocks.

Fields to extract:
- "receiptNumber": the bill/invoice/receipt number printed on the receipt (string or null)
- "receiptDate": the date on the receipt in ISO format YYYY-MM-DD (string or null)
- "storeName": the name of the store, restaurant, or business printed at the top of the receipt (string or null)
- "customerName": the name of the customer or "Bill To" name if printed on the receipt (string or null)
- "totalAmount": the final total amount paid as a number with decimals (number or null)
- "items": array of line items, each with "name" (string), "quantity" (number), "price" (number)
- "confidence": your confidence in the extraction accuracy as a number between 0 and 1

Return ONLY the JSON object.`,
            },
            {
              inlineData: { mimeType: "image/jpeg", data: base64 },
            },
          ],
        },
      ],
    });

    const elapsed = Date.now() - start;
    console.log(`✅ [Gemini] API responded in ${elapsed}ms`);

    const text = response.text.trim();
    // Strip markdown code fences if model wraps output
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const data = JSON.parse(cleaned);

    data.ocrProvider = "gemini";

    // Normalize to standard output shape with totalCandidates
    if (!data.totalCandidates) {
      data.totalCandidates = data.totalAmount != null
        ? [{ id: "gemini_1", type: "total", label: "Total", amount: data.totalAmount, priority: 75, sourceLine: "Gemini extraction", isRecommended: true }]
        : [];
    }
    if (!data.rawText) data.rawText = "";

    console.log(`✅ [Gemini] Extraction complete: confidence=${data.confidence}, total=${data.totalAmount}, date=${data.receiptDate}, store=${data.storeName}, customer=${data.customerName}`);

    return data;
  },
};

// ─── PaddleOCR helpers ────────────────────────────────────────────────────────

/**
 * Parse plain text (combined from both PaddleOCR APIs) into structured receipt fields.
 * Uses regex only — no AI inference.
 */
function parseReceiptText(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const TOTAL_RULES = [
    { type: "grand_total", label: "Grand Total", priority: 100, regex: /\bgrand\s*total\b/i },
    { type: "net_amount", label: "Net Amount", priority: 90, regex: /\bnet\s*(?:amount|amt|total)\b/i },
    { type: "total_amount", label: "Total Amount", priority: 85, regex: /\btotal\s*amount\b/i },
    { type: "amount_due", label: "Amount Due", priority: 80, regex: /\b(?:amount\s*due|balance\s*due|payable)\b/i },
    { type: "subtotal", label: "Subtotal", priority: 70, regex: /\bsub\s*total\b|\bsubtotal\b/i },
    { type: "total", label: "Total", priority: 75, regex: /\btotal\b/i },
  ];

  const TAX_REGEX = /\b(?:tax|vat|gst)\b/i;
  const DISCOUNT_REGEX = /\bdiscount\b/i;

  const parseAmountFromLine = (line) => {
    const amountRegex = /(?:NPR|NRS|RS\.?|INR|USD|\$|£|€|रु)?\s*([\d]{1,3}(?:,[\d]{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;
    const matches = [];
    let m;
    while ((m = amountRegex.exec(line)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0) matches.push(val);
    }
    if (!matches.length) return null;
    return matches[matches.length - 1];
  };

  const dedupeCandidates = (list) => {
    const map = new Map();
    for (const c of list) {
      const key = `${c.type}:${c.amount.toFixed(2)}`;
      const existing = map.get(key);
      if (!existing || c.priority > existing.priority) {
        map.set(key, c);
      }
    }
    return Array.from(map.values());
  };

  const buildTotalCandidates = () => {
    const candidates = [];
    let taxAmount = null;
    let discountAmount = null;

    for (let idx = 0; idx < lines.length; idx += 1) {
      const line = lines[idx];
      const matchedRule = TOTAL_RULES.find((rule) => {
        if (rule.type === "total") {
          if (/\bgrand\s*total\b/i.test(line)) return false;
          if (/\bnet\s*(?:amount|amt|total)\b/i.test(line)) return false;
          if (/\btotal\s*amount\b/i.test(line)) return false;
          if (/\bsub\s*total\b|\bsubtotal\b/i.test(line)) return false;
        }
        return rule.regex.test(line);
      });

      const amountOnLine = parseAmountFromLine(line);
      const amountOnNextLine = idx + 1 < lines.length ? parseAmountFromLine(lines[idx + 1]) : null;
      const amount = amountOnLine !== null ? amountOnLine : amountOnNextLine;

      if (amount === null) continue;

      if (matchedRule) {
        candidates.push({
          id: `${matchedRule.type}_${candidates.length + 1}`,
          type: matchedRule.type,
          label: matchedRule.label,
          amount,
          priority: matchedRule.priority,
          sourceLine: line,
          isRecommended: false,
        });
        continue;
      }

      if (TAX_REGEX.test(line)) taxAmount = amount;
      if (DISCOUNT_REGEX.test(line)) discountAmount = amount;
    }

    let deduped = dedupeCandidates(candidates);

    const baseForCalculation = deduped.find((c) =>
      ["grand_total", "net_amount", "total_amount", "amount_due", "total"].includes(c.type)
    );

    const hasSubtotal = deduped.some((c) => c.type === "subtotal");
    if (!hasSubtotal && baseForCalculation && taxAmount !== null) {
      const calculatedSubtotal = baseForCalculation.amount - taxAmount + (discountAmount || 0);
      if (calculatedSubtotal > 0) {
        deduped.push({
          id: `subtotal_calc_${deduped.length + 1}`,
          type: "subtotal",
          label: "Calculated Subtotal",
          amount: Math.round(calculatedSubtotal * 100) / 100,
          priority: 65,
          sourceLine: "Derived from total/tax/discount",
          isRecommended: false,
        });
      }
    }

    if (!deduped.length) {
      const allAmounts = [];
      const fallbackRegex = /(?:NPR|NRS|RS\.?|INR|USD|\$|£|€|रु)?\s*([\d]{1,3}(?:,[\d]{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/gi;
      let m;
      while ((m = fallbackRegex.exec(text)) !== null) {
        const val = parseFloat(m[1].replace(/,/g, ""));
        if (!isNaN(val) && val > 0) allAmounts.push(val);
      }
      const maxAmount = allAmounts.length ? Math.max(...allAmounts) : null;
      if (maxAmount !== null) {
        deduped.push({
          id: "other_1",
          type: "other",
          label: "Other",
          amount: maxAmount,
          priority: 10,
          sourceLine: "Fallback highest amount",
          isRecommended: false,
        });
      }
    }

    deduped = deduped
      .sort((a, b) => b.priority - a.priority)
      .map((c, idx) => ({ ...c, order: idx + 1 }));

    if (deduped.length) {
      deduped[0].isRecommended = true;
    }

    return deduped;
  };

  // ── Bill / Receipt Number ─────────────────────────────────────────────────
  let receiptNumber = null;
  const billMatch = text.match(
    /(?:bill\s*(?:no|#|number)|receipt\s*(?:no|#)|inv(?:oice)?\s*(?:no|#))[:\s]*([A-Z0-9\-\/]+)/i
  );
  if (billMatch) receiptNumber = billMatch[1].trim();

  // ── Total Amount candidates (for radio selection in confirm UI) ────────────
  const totalCandidates = buildTotalCandidates();
  const recommendedTotal = totalCandidates.find((c) => c.isRecommended);
  const totalAmount = recommendedTotal ? recommendedTotal.amount : null;

  // ── Date ─────────────────────────────────────────────────────────────────
  let receiptDate = null;
  const datePatterns = [
    /(\d{4}[-\/]\d{2}[-\/]\d{2})/,                          // YYYY-MM-DD
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,                          // DD-MM-YYYY or MM-DD-YYYY
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4})/i, // DD Mon YYYY
  ];
  for (const pat of datePatterns) {
    const dm = text.match(pat);
    if (dm) {
      const parsed = new Date(dm[1]);
      if (!isNaN(parsed.getTime())) {
        receiptDate = parsed.toISOString().slice(0, 10);
        break;
      }
    }
  }

  // ── Store Name — first non-trivial line from top ──────────────────────────
  let storeName = null;
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like dates, addresses, phone numbers, or bill numbers
    if (/^\d{1,4}[-\/]\d{1,2}[-\/]\d{2,4}/.test(line)) continue;
    if (/^(\+?[\d\s\-]{7,})$/.test(line)) continue;
    if (/^(receipt|invoice|bill|tax|vat|gst)/i.test(line)) continue;
    if (line.length < 3) continue;
    storeName = line;
    break;
  }

  // ── Items — Step 1: markdown table parsing ───────────────────────────────
  const items = [];
  const tableRowRe = /\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
  let rowMatch;
  while ((rowMatch = tableRowRe.exec(text)) !== null) {
    const [, col1, col2, col3] = rowMatch.map((c) => c.trim());
    const price = parseFloat(col3.replace(/,/g, ""));
    const qty = parseFloat(col2.replace(/,/g, ""));
    if (!isNaN(price) && col1 && !/^-+$/.test(col1) && !/name/i.test(col1)) {
      items.push({ name: col1, quantity: isNaN(qty) ? 1 : qty, price });
    }
  }

  // ── Items — Step 2: fallback plain-text parsing (if no table found) ───────
  if (items.length === 0) {
    const SKIP_RE = /\b(?:total|subtotal|sub-total|vat|tax|gst|discount|service\s*charge|tip|delivery|amount|due|payable|change|cash|card|balance|thank|welcome|receipt|invoice|bill|date|time|table|server|cashier|ref)\b/i;

    for (const line of lines) {
      if (SKIP_RE.test(line)) continue;
      if (line.length < 4) continue;

      // 3-column: "Name    qty    price" (2+ spaces separating each column)
      const m3 = line.match(/^(.+?)\s{2,}(\d+(?:\.\d+)?)\s{2,}([\d,]+(?:\.\d{1,2})?)$/);
      if (m3) {
        const qty = parseFloat(m3[2]);
        const price = parseFloat(m3[3].replace(/,/g, ""));
        if (!isNaN(qty) && !isNaN(price) && price > 0 && qty > 0 && qty < 1000) {
          items.push({ name: m3[1].trim(), quantity: qty, price });
          continue;
        }
      }

      // 2-column: "Name    price" (quantity defaults to 1, name must start with a letter)
      const m2 = line.match(/^([A-Za-z].+?)\s{2,}([\d,]+(?:\.\d{1,2})?)$/);
      if (m2) {
        const price = parseFloat(m2[2].replace(/,/g, ""));
        if (!isNaN(price) && price > 0 && price < 1000000) {
          items.push({ name: m2[1].trim(), quantity: 1, price });
        }
      }
    }
  }

  // ── Confidence — field coverage score ─────────────────────────────────────
  let confidence = 0;
  if (totalAmount !== null) confidence += 0.4;
  if (receiptDate !== null) confidence += 0.25;
  if (storeName !== null) confidence += 0.2;
  if (receiptNumber !== null) confidence += 0.15;
  if (confidence === 0) confidence = 0.1; // floor

  return {
    receiptNumber,
    receiptDate,
    storeName,
    totalAmount,
    totalCandidates,
    items,
    confidence,
  };
}

/**
 * OCR Provider: PaddleOCR (PP-StructureV3 + PP-OCRv5 hybrid)
 * Uses rule-based regex parsing — no GPT/AI inference.
 */
const paddleOCRProvider = {
  name: "paddleocr",
  async extract(buffer, _mimeType) {
    // Resize large images before sending — PaddleOCR servers drop connections on payloads >~1 MB.
    // Receipt OCR needs ~1200px width at most; resizing to 1500px max side at 80% JPEG quality
    // typically brings a 4 MB phone photo down to ~150–300 KB.
    const originalKB = Math.round(buffer.length / 1024);
    const resized = await sharp(buffer)
      .resize({ width: 1500, height: 1500, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    const resizedKB = Math.round(resized.length / 1024);
    console.log(`📐 [PaddleOCR] Image resized: ${originalKB} KB → ${resizedKB} KB`);

    const base64 = resized.toString("base64");
    const token = process.env.PADDLEOCR_TOKEN;
    const structureUrl = process.env.PADDLEOCR_STRUCTURE_URL;
    const ocrUrl = process.env.PADDLEOCR_OCR_URL;

    if (!token || !structureUrl || !ocrUrl) {
      throw new Error("❌ PaddleOCR env vars not set (PADDLEOCR_TOKEN, PADDLEOCR_STRUCTURE_URL, PADDLEOCR_OCR_URL)");
    }

    const headers = {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({ file: base64, fileType: 1 });

    console.log(`📡 [PaddleOCR] Image encoded (${Math.round(base64.length / 1024)} KB base64), calling APIs in parallel...`);
    console.log(`   PP-StructureV3: ${structureUrl}`);
    console.log(`   PP-OCRv5:       ${ocrUrl}`);

    // Use Node.js native fetch (undici) — different TLS stack from axios,
    // avoids the bad_record_mac SSL errors that plagued the axios approach.
    const makeRequest = async (url, label) => {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 90000);
      const start = Date.now();
      try {
        const res = await fetch(url, { method: "POST", headers, body, signal: ac.signal });
        clearTimeout(timer);
        const elapsed = Date.now() - start;
        if (!res.ok) {
          console.warn(`⚠️ [PaddleOCR] ${label} HTTP ${res.status} after ${elapsed}ms`);
          throw new Error(`HTTP ${res.status}`);
        }
        console.log(`✅ [PaddleOCR] ${label} responded in ${elapsed}ms`);
        return await res.json();
      } catch (err) {
        clearTimeout(timer);
        const elapsed = Date.now() - start;
        const cause = err.cause;
        console.warn(`⚠️ [PaddleOCR] ${label} failed after ${elapsed}ms — ${err.message}${cause ? ` | cause: ${cause.code || cause.message}` : ""}`);
        throw err;
      }
    };

    const [structureRes, ocrRes] = await Promise.allSettled([
      makeRequest(structureUrl, "PP-StructureV3"),
      makeRequest(ocrUrl, "PP-OCRv5"),
    ]);

    // ── Extract text from PP-StructureV3 ──────────────────────────────────
    // Response shape (expected): { result: { layoutParsingResults: [{ markdown: { text } }] } }
    let structureText = "";
    if (structureRes.status === "fulfilled") {
      try {
        const val = structureRes.value;
        // Support both wrapped and flat shapes
        const results =
          val?.result?.layoutParsingResults ||
          val?.layoutParsingResults ||
          val?.result?.results ||
          val?.results ||
          [];
        structureText = results
          .map((r) => r?.markdown?.text || r?.text || r?.content || "")
          .filter(Boolean)
          .join("\n");
        if (structureText) {
          console.log(`✅ [PP-StructureV3] Extracted ${structureText.split("\n").length} lines`);
        } else {
          console.warn(`⚠️ [PP-StructureV3] No text found — response keys: ${Object.keys(val || {}).join(", ")}`);
        }
      } catch (_) { /* ignore parse errors */ }
    } else {
      console.warn(`⚠️ PP-StructureV3 yielded no text (status: ${structureRes.status})`);
    }

    // ── Extract raw text from PP-OCRv5 ───────────────────────────────────
    // Response shape: { result: { ocrResults: [{ prunedResult: { rec_texts: [...], dt_polys: [...] } }] } }
    let rawText = "";
    if (ocrRes.status === "fulfilled") {
      try {
        const val = ocrRes.value;
        // Support both wrapped ({ result: { ocrResults } }) and flat ({ ocrResults }) shapes
        const ocrItems = val?.result?.ocrResults || val?.ocrResults || [];
        rawText = ocrItems
          .flatMap((r) => {
            const pr = r?.prunedResult;
            if (!pr) return [];
            // prunedResult is an object — text lines are in rec_texts[]
            if (Array.isArray(pr.rec_texts)) return pr.rec_texts;
            // Fallback: if prunedResult is a plain string
            if (typeof pr === "string") return [pr];
            return [];
          })
          .filter(Boolean)
          .join("\n");

        if (rawText) {
          console.log(`✅ [PP-OCRv5] Extracted ${rawText.split("\n").length} text lines`);
        } else {
          console.warn(`⚠️ [PP-OCRv5] No rec_texts found — prunedResult keys: ${Object.keys(ocrItems[0]?.prunedResult || {}).join(", ")}`);
        }
      } catch (parseErr) {
        console.warn(`⚠️ [PP-OCRv5] Parse error: ${parseErr.message}`);
      }
    } else {
      console.warn(`⚠️ PP-OCRv5 yielded no text (status: ${ocrRes.status})`);
    }

    if (!structureText && !rawText) {
      throw new Error("❌ Both PaddleOCR APIs failed to return usable text");
    }

    // Prefer structure text for parsing; fall back to raw OCR text
    const primaryText = structureText || rawText;
    const parsed = parseReceiptText(primaryText);

    console.log(`✅ PaddleOCR: confidence=${parsed.confidence}, total=${parsed.totalAmount}, date=${parsed.receiptDate}`);

    return {
      receiptNumber: parsed.receiptNumber,
      receiptDate: parsed.receiptDate,
      storeName: parsed.storeName,
      totalAmount: parsed.totalAmount,
      totalCandidates: parsed.totalCandidates || [],
      items: parsed.items,
      rawText: rawText || structureText,
      confidence: parsed.confidence,
      ocrProvider: "paddleocr",
    };
  },
};

/**
 * Provider registry — add new providers here, no other code needs to change.
 */
const PROVIDERS = {
  paddleocr: paddleOCRProvider,
  openai: openAIProvider,
  google_vision: googleVisionProvider,
  gemini: geminiProvider,
  aws_textract: awsTextractProvider,
};

/**
 * Main OCR service entry point.
 * Provider is selected by the OCR_PROVIDER environment variable (default: "paddleocr").
 * Can be overridden per-request by passing providerOverride parameter (for admin testing).
 *
 * @param {Buffer} buffer - Image buffer from multer memoryStorage
 * @param {string} mimeType - e.g. "image/jpeg"
 * @param {string|null} providerOverride - Optional provider name to override default (e.g., "google_vision")
 * @returns {Promise<{
 *   receiptNumber: string|null,
 *   receiptDate: string|null,
 *   storeName: string|null,
 *   totalAmount: number|null,
 *   items: Array<{name: string, quantity: number, price: number}>,
 *   confidence: number,
 *   ocrProvider: string
 * }>}
 */
const ocrService = {
  async extractReceiptData(buffer, mimeType, providerOverride = null) {
    const providerName = providerOverride || process.env.OCR_PROVIDER || "paddleocr";
    const provider = PROVIDERS[providerName];

    if (!provider) {
      throw new Error(`❌ Unknown OCR provider: "${providerName}". Valid options: ${Object.keys(PROVIDERS).join(", ")}`);
    }

    if (providerOverride) {
      console.log(`✅ OCR: Using provider "${provider.name}" (admin override)`);
    } else {
      console.log(`✅ OCR: Using provider "${provider.name}" (default)`);
    }
    
    return provider.extract(buffer, mimeType);
  },
};

module.exports = ocrService;
