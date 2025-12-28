
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
        return items.map((item: any) => ({
            id: crypto.randomUUID(),
            type: (item.type && Object.values(ElementType).includes(item.type)) ? item.type : ElementType.VIGA_SUPERIOR,
            observation: item.observation || 'Item Importado',
            quantity: Number(item.quantity) || 1,
            length: Number(item.length) || 3, // meters
            width: Number(item.width) || 0.15, // meters
            height: Number(item.height) || 0.3, // meters

            // Stirrups
            hasStirrups: item.hasStirrups ?? true,
            stirrupGauge: String(item.stirrupGauge || '5.0'),
            stirrupSpacing: Number(item.stirrupSpacing) || 20,
            stirrupWidth: Number(item.stirrupWidth) || 15,
            stirrupHeight: Number(item.stirrupHeight) || 25,
            stirrupPosition: item.stirrupPosition,

            // Bars
            mainBars: (item.mainBars || []).map((bar: any) => {
                const hStart = Number(bar.hookStart) || 0;
                const hEnd = Number(bar.hookEnd) || 0;

                // 1. Determine Shape
                let shape = bar.shape || 'straight';
                // Auto-correct shape if hooks exist but shape is straight
                if ((hStart > 0 || hEnd > 0) && shape === 'straight') {
                    const placement = bar.placement || (bar.usage === BarUsage.PRINCIPAL ? 'bottom' : 'top');
                    shape = (placement === 'top') ? 'u_down' : 'u_up';
                }

                // 2. Map Shape to Hook Types (REQUIRED for Renderer)
                let hookStartType: 'up' | 'down' | 'none' = 'none';
                let hookEndType: 'up' | 'down' | 'none' = 'none';

                if (shape === 'u_up') {
                    hookStartType = 'up';
                    hookEndType = 'up';
                } else if (shape === 'u_down') {
                    hookStartType = 'down';
                    hookEndType = 'down';
                } else if (shape === 'l_left_up') {
                    hookStartType = 'up';
                } else if (shape === 'l_right_up') {
                    hookEndType = 'up';
                }

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
            }),

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
        }));
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
  Analyze this structural engineering drawing (beam/column reinforcement detail) and extract technical specifications.
  IGNORE COLORS. Focus on lines and text labels.
  
  ${learningContext}

  CRITICAL INSTRUCTIONS:

  1. SPANS (VÃOS) & LENGTH:
     - Total Beam Length (L) is often different from Span (Vão).
     - ONLY detect a span if there is an explicit HORIZONTAL dimension line between supports (P1, P2, etc).
     - If the "Center Concrete" drawing looks LONGER than the bars, double-check if you read the length correctly.
     - Bars usually go from end-to-end of the concrete.

  2. REBAR IDENTIFICATION (FERROS):
     - Look for labels starting with "N" (e.g., "N1", "N3"). 
     - "C=" or "Comp=" means TOTAL CUT LENGTH of the bar.
     - IF "C=500" is seen and hooks are "15" on each side, then segmentA (straight part) must be 500 - 15 - 15 = 470.
     - Always ensure: hookStart + segmentA + hookEnd = Total Cut Length (C).

  3. STIRRUPS (ESTRIBOS) - **PRIMARY SOURCE: CROSS-SECTIONS**:
     - LOOK FOR SECTIONS labeled "CORTE A-A", "SECÇÃO", etc.
     - **SPECS PATTERN:** "13 N3 ø 5.0 c/15" or "13 n3 f 5mm c=81".
       - "c/15" or "c/0.15" = SPACING (Espaçamento) between stirrups.
       - "c=81" or "C=81" = CUT LENGTH of one stirrup (length of the cut wire). 
       - DISTINGUISH THESE! If you see "c/15", spacing is 15. If you see "C=81", it's the wire length.
       - "f 5mm" or "ø 5.0" = GAUGE.
     - **QUANTITY:** If "13 N3" is written, quantity is 13.

  4. HEURISTICS FOR DIMENSIONS:
     - Concrete width/height are usually around 15-20cm (width) and 30-60cm (height) for beams.
     - Stirrup dimensions are usually the concrete dimensions minus 5-6cm (cover).

  For each structural element found, create an object in the JSON array:
  - type: "Viga", "Balanço", "Pilarete", "Pilar", "Sapata"
  - observation: Label (e.g., "V130")
  - quantity: Number (1)
  - length: Total length in meters
  - width: Section width (m)
  - height: Section height (m)
  
  - hasStirrups: boolean
  - stirrupGauge: mm (string e.g. "5.0")
  - stirrupSpacing: cm (number e.g. 15)
  - stirrupWidth: cm (number)
  - stirrupHeight: cm (number)
  - stirrupPosition: Label (N3)
  
  - mainBars: Array of bars
    - count: number
    - gauge: mm (string)
    - placement: "top" or "bottom"
    - shape: "u_up", "u_down", "straight"
    - segmentA: Straight length (cm)
    - hookStart: Hook length (cm)
    - hookEnd: Hook length (cm)
    - position: Label (N1)

  - supports: Array of supports (P1, P2...)
    - label: Name
    - position: Center distance from start (cm).
    - width: column width (cm)
    - leftGap: clear zone left of support (cm)
    - rightGap: clear zone right of support (cm)

  Return ONLY valid JSON.
  `;

    const body = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type || 'image/jpeg', data: base64Image } }
            ]
        }],
        generationConfig: {
            temperature: 0.2, // Um pouco mais flexível para evitar travamento em sintaxe
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        }
    };

    // Lista de modelos conhecidos para visão (ordem de prioridade)
    const knownModels = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-pro-vision", // Clássico v1
        "gemini-1.0-pro-vision-latest"
    ];

    let candidateModels = [...knownModels];

    // 1. Tenta descobrir o melhor modelo disponível na chave
    try {
        const listReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (listReq.ok) {
            const listData = await listReq.json();
            if (listData.models) {
                // Filtra modelos que suportam generateContent e visão (heurística por nome)
                const availableVision = listData.models
                    .map((m: any) => m.name.replace('models/', ''))
                    .filter((name: string) =>
                        (name.includes('flash') || name.includes('vision') || name.includes('pro')) &&
                        !name.includes('embedding')
                    );

                // Coloca os descobertos no topo da lista
                if (availableVision.length > 0) {
                    // Remove duplicatas e prioriza os descobertos
                    const others = candidateModels.filter(m => !availableVision.includes(m));
                    candidateModels = [...availableVision, ...others];
                    console.log("Modelos detectados na chave:", availableVision);
                }
            }
        }
    } catch (e) {
        console.warn("Falha silenciosa na descoberta de modelos:", e);
    }

    // 2. Tenta executar TODOS os candidatos em TODAS as versões
    const versions = ["v1beta", "v1"];
    let lastError: any;
    let success = false;

    for (const model of candidateModels) {
        if (success) break;

        for (const version of versions) {
            if (success) break;

            try {
                // console.log(`Tentando: ${model} (${version})...`);
                const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    const err = await response.json();
                    const msg = err.error?.message || "Erro";

                    // Se for erro de "not found", tenta o próximo silenciosamente
                    if (msg.includes("not found") || msg.includes("not supported")) {
                        continue;
                    }
                    throw new Error(msg); // Outros erros (ex: key inválida) devem ser reportados
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) continue; // Resposta vazia, tenta próximo

                // SUCESSO!
                success = true;
                console.log(`SUCESSO com modelo: ${model} (${version})`);
                return parseGeminiResponse(text);

            } catch (error) {
                lastError = error;
                continue;
            }
        }
    }

    throw lastError || new Error("Não foi possível processar a imagem com nenhum modelo disponível. Verifique se a API 'Generative AI' está habilitada no Google Cloud.");
};
