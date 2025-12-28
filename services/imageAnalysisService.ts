
import { SteelItem, ElementType, MainBarGroup, BarUsage } from '../types';

const GEN_AI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

/**
 * Converts a File object to a clean Base64 string (without data:image/...;base64 prefix)
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * Parses the AI response text into SteelItem objects
 */
const parseGeminiResponse = (responseText: string): SteelItem[] => {
    console.log(">>> RESPOSTA BRUTA DA IA:", responseText);
    try {
        // Clean up markdown code blocks if present
        // Clean up markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        // Try to find Array [...] OR Object {...}
        let firstBracket = cleanText.indexOf('[');
        let lastBracket = cleanText.lastIndexOf(']');

        // If no array found, try finding a single object
        if (firstBracket === -1 || lastBracket === -1) {
            firstBracket = cleanText.indexOf('{');
            lastBracket = cleanText.lastIndexOf('}');
        }

        if (firstBracket === -1 || lastBracket === -1) {
            console.error("AI Response not a valid JSON structure:", cleanText);
            throw new Error("Formato inválido recebido da IA (esperado JSON)");
        }

        const jsonString = cleanText.substring(firstBracket, lastBracket + 1);
        const data = JSON.parse(jsonString);

        // Ensure data is an array
        const items = Array.isArray(data) ? data : [data];

        // Map to SteelItem structure ensuring required fields
        return items.map((item: any) => {
            // ... parsing bars first to use them for validation ...
            const parsedBars = (item.mainBars || []).map((bar: any) => {
                const hStart = Number(bar.hookStart) || 0;
                const hEnd = Number(bar.hookEnd) || 0;
                let shape = bar.shape || 'straight';

                // AUTO-CORRECTION: If hooks exist, FORCE the shape to be valid
                if ((hStart > 0 || hEnd > 0) && shape === 'straight') {
                    const placement = bar.placement || (bar.usage === BarUsage.PRINCIPAL ? 'bottom' : 'top');
                    shape = (placement === 'top') ? 'u_down' : 'u_up';
                }

                // Map Hook Types
                let hookStartType: 'up' | 'down' | 'none' = 'none';
                let hookEndType: 'up' | 'down' | 'none' = 'none';

                if (shape === 'u_up') { hookStartType = 'up'; hookEndType = 'up'; }
                else if (shape === 'u_down') { hookStartType = 'down'; hookEndType = 'down'; }
                else if (shape === 'l_left_up') { hookStartType = 'up'; }
                else if (shape === 'l_right_up') { hookEndType = 'up'; }

                return {
                    id: crypto.randomUUID(),
                    count: Number(bar.count) || 2,
                    gauge: String(bar.gauge || '10.0'),
                    usage: bar.usage || BarUsage.PRINCIPAL,
                    placement: bar.placement || (bar.usage === BarUsage.PRINCIPAL ? 'bottom' : 'top'),
                    segmentA: Number(bar.segmentA) || (Number(item.length) * 100),
                    shape: shape,
                    hookStart: hStart,
                    hookEnd: hEnd,
                    hookStartType: hookStartType,
                    hookEndType: hookEndType,
                    position: bar.position
                };
            });

            // SANITY CHECK: Concrete Length vs Bar Length
            // Find longest bar (segmentA + hooks is Total Cut, but 'concrete coverage' is mostly roughly segmentA)
            // Actually, segmentA is the straight part. Concrete should be roughly SegmentA + cover.
            // If item.length (from AI) is 300 (3m) but max SegmentA is 200cm, then AI is wrong about concrete length.

            let rawLength = Number(item.length) || 3;
            const maxBarSegment = Math.max(...parsedBars.map((b: any) => b.segmentA || 0), 0);

            if (maxBarSegment > 0) {
                const minConcreteNeeded = (maxBarSegment / 100); // meters
                // If AI says length is much larger (> 20% diff) than the bar, clamp it down.
                // Or if AI says length is smaller than bar? Correct it up.

                // Heuristic: Concrete usually is roughly equal to max straight bar length.
                const diff = Math.abs(rawLength - minConcreteNeeded);
                if (diff > 0.5 || rawLength < minConcreteNeeded) {
                    // console.log(`Auto-correcting length from ${rawLength} to ${minConcreteNeeded} based on bars`);
                    rawLength = Number((minConcreteNeeded).toFixed(2)); // Exact fit, no margin
                }
            }

            return {
                id: crypto.randomUUID(),
                type: (item.type && Object.values(ElementType).includes(item.type)) ? item.type : ElementType.VIGA_SUPERIOR,
                observation: item.observation || 'Item Importado',
                quantity: Number(item.quantity) || 1,
                length: rawLength,
                width: Number(item.width) || 0.15,
                height: Number(item.height) || 0.3,

                // Stirrups
                hasStirrups: item.hasStirrups ?? true,
                stirrupGauge: String(item.stirrupGauge || '5.0'),
                stirrupSpacing: Number(item.stirrupSpacing) || 20,
                stirrupWidth: Number(item.stirrupWidth) || 15,
                stirrupHeight: Number(item.stirrupHeight) || 25,
                stirrupPosition: item.stirrupPosition,

                mainBars: parsedBars,

                // Supports
                supports: (item.supports || []).map((sup: any) => ({
                    label: sup.label,
                    position: Number(sup.position) || 0,
                    width: Number(sup.width) || 20,
                    leftGap: Number(sup.leftGap) || 0,
                    rightGap: Number(sup.rightGap) || 0
                })),
                startGap: Number(item.startGap) || 0,
                endGap: Number(item.endGap) || 0,

                isConfigured: true
            };
        });
    } catch (e) {
        console.error("Error parsing Gemini response:", e);
        throw new Error("Falha ao processar dados da IA: " + (e as Error).message);
    }
};

export const analyzeImageWithGemini = async (file: File, apiKey: string, referenceItems?: SteelItem[]): Promise<SteelItem[]> => {
    if (!apiKey) throw new Error("API Key is required");

    // Helper to safely access env variables in Vite/Vercel
    const getEnv = (name: string) => {
        try {
            // @ts-ignore - access vite env
            return import.meta.env[name];
        } catch (e) {
            return process.env[name];
        }
    };

    // Convert reference items to a few-shot string for "learning"
    const learningContext = referenceItems && referenceItems.length > 0
        ? `
  HERE ARE CORRECT EXAMPLES FROM PREVIOUS ANALYSES (LEARN FROM THESE):
  ${JSON.stringify(referenceItems.slice(-3).map(item => ({
            observation: item.observation,
            length: item.length,
            stirrupQty: item.mainBars[0]?.count, // simplistic summary
            stirrupSpec: `${item.stirrupGauge} c/${item.stirrupSpacing}`
        })), null, 2)}
  ` : '';

    const base64Image = await fileToBase64(file);

    const prompt = `
  You are an expert Structural Engineer assistant. Analyze this reinforcement drawing following this STRICT SEQUENCE.
  IGNORE COLORS. READ TEXT LABELS.
  
  ${learningContext}

  --- EXECUTION SEQUENCE ---

  ### STEP 1: READ MAIN LONGITUDINAL BARS (Ferros Longitudinais)
  - Look for long horizontal lines representing the beam bars.
  - Find their labels, usually format: "2 N1 ø 8.0 c=237" or similar.
    - "2" = Quantity (Count).
    - "N1" = Position.
    - "ø 8.0" or "f 8mm" = Gauge.
    - "c=237" = Total Cut Length (Comprimento Total).
  - **Top vs Bottom**: If the bar is drawn at the top of the beam, it is Top. If at bottom, it is Bottom.
  - **Hooks (Dobras)**: Check the ends of these lines for vertical segments limits (e.g. "15").

  ### STEP 2: READ STIRRUPS (Estribos) - LOOK AT THE RIGHT SIDE OR SECTION A-A
  - Locate the Cross-Section (rectangle with dots) or the callout typically on the RIGHT SIDE of the drawing.
  - **READ THE LABEL EXACTLY** (e.g., "13 N3 ø 5.0 c/81" or "13 N3 c/15").
    - **QUANTITY IS LAW**: If it says "13 N3", then quantity is 13. DO NOT CALCULATE using spans.
    - "c=81" means Total Length of the stirrup wire.
    - "c/15" means Spacing.
  - **DIMENSIONS**: Look at the small rectangle (Section A-A). The numbers on its sides are Width and Height.
    - Example: "15" and "35". Width=15, Height=35.

  ### STEP 3: SPANS (Vãos) - SYMBOLIC ONLY
  - Spans are secondary information.
  - Only record a span if you see explicit horizontal dimension lines between supports (P1, P2..).
  - DO NOT override the Stirrup Quantity found in Step 2 based on span calculations.

  ========================================
  OUTPUT JSON FORMAT:
  For each structural element found:
  {
    "type": "Viga",
    "observation": "Label (e.g. V1)",
    "quantity": 1,
    "length": Total concrete length (m),
    "width": Concrete Section Width (m),
    "height": Concrete Section Height (m),

    "hasStirrups": true,
    "stirrupGauge": "5.0",
    "stirrupSpacing": 15,
    "stirrupWidth": 15,    // FROM SECTION A-A
    "stirrupHeight": 35,   // FROM SECTION A-A
    "stirrupPosition": "N3", // FROM LABEL

    "mainBars": [
      {
        "count": 2,
        "position": "N1",
        "gauge": "10.0",
        "placement": "top" or "bottom",
        "shape": "u_up" | "u_down" | "straight",
        "segmentA": 237, // Straight part
        "hookStart": 0,
        "hookEnd": 0
      }
    ],

    "supports": [
       { "label": "P1", "position": 0, "width": 20 }
    ]
  }

  Return ONLY valid JSON.
  `;

    // Configuration for Speed and Accuracy
    const body = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type || 'image/jpeg', data: base64Image } }
            ]
        }],
        generationConfig: {
            temperature: 0.1, // Lower temperature for faster, more deterministic output
            topK: 1, // Only consider the very best token (faster decoding)
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
        }
    };

    // SPEED OPTIMIZATION:
    // 1. Direct prioritized list (Flash is fastest).
    // 2. No dynamic discovery (saves 1 round-trip).
    // 3. Stick to v1beta which is standard for these models.
    const candidateModels = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest" // Fallback only if Flash fails completely
    ];

    let lastError: any;

    for (const model of candidateModels) {
        try {
            // console.log(`Tentando modelo rápido: ${model}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                const msg = err.error?.message || "Erro";
                // Only continue if it's a 404 (model found) or similar. Authentication errors should throw immediately.
                if (msg.includes("not found") || msg.includes("not supported")) {
                    continue;
                }
                throw new Error(msg);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) continue;

            console.log(`SUCESSO RÁPIDO com: ${model}`);
            return parseGeminiResponse(text);

        } catch (error) {
            lastError = error;
            console.warn(`Falha no modelo ${model}, tentando próximo...`);
            continue;
        }
    }

    throw lastError || new Error("Não foi possível processar a imagem. Verifique sua chave API.");
};
