
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
    try {
        // Clean up markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        // Find the first [ and last ] to ensure valid array extraction
        const firstBracket = cleanText.indexOf('[');
        const lastBracket = cleanText.lastIndexOf(']');

        if (firstBracket === -1 || lastBracket === -1) {
            console.error("AI Response not a valid array:", cleanText);
            throw new Error("Formato inválido recebido da IA");
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
            mainBars: (item.mainBars || []).map((bar: any, idx: number) => ({
                id: crypto.randomUUID(),
                count: Number(bar.count) || 2,
                gauge: String(bar.gauge || '10.0'),
                usage: bar.usage || BarUsage.PRINCIPAL,
                placement: bar.placement || (bar.usage === BarUsage.PRINCIPAL ? 'bottom' : 'top'),
                segmentA: Number(bar.segmentA) || (Number(item.length) * 100),
                shape: bar.shape || 'straight',
                hookStart: Number(bar.hookStart) || 0,
                hookEnd: Number(bar.hookEnd) || 0,
                position: bar.position
            })),

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

export const analyzeImageWithGemini = async (file: File, apiKey: string): Promise<SteelItem[]> => {
    if (!apiKey) throw new Error("API Key is required");

    const base64Image = await fileToBase64(file);

    const prompt = `
  Analyze this structural engineering drawing (beam/column reinforcement detail) and extract the technical specifications into a JSON format array.
  
  For each structural element found (Beam V..., Column P..., etc.), create an object with these exact fields:
  - type: One of "Viga", "Balanço", "Pilarete", "Pilar", "Sapata"
  - observation: The element name/label (e.g., "V130", "P1")
  - quantity: Number of elements (1 by default)
  - length: Total length in meters (float)
  - width: Cross section width in meters (float)
  - height: Cross section height in meters (float)
  
  - hasStirrups: boolean (true)
  - stirrupGauge: Stirrup diameter in mm (string "5.0", "6.3", etc)
  - stirrupSpacing: Spacing in cm (number)
  - stirrupWidth: Stirrup width in cm (number, usually section width - cover)
  - stirrupHeight: Stirrup height in cm (number, usually section height - cover)
  - stirrupPosition: Stirrup position label (e.g. "N2") if visible.
  
  - mainBars: Array of objects for longitudinal bars:
    - count: Number of bars
    - gauge: Diameter in mm (string "6.3", "8.0", "10.0", "12.5", "16.0", etc)
    - usage: "Principal" (bottom), "Porta-Estribo" (top), "Costela" (side), "Camada 2"
    - placement: "top" (for Porta-Estribo/negative), "bottom" (for Principal/positive), "distributed" (for Costela/side), "center"
    - position: Bar position label (e.g. "N1", "N4")
    - shape: "straight", "u_up", "u_down", "l_left_up", "l_right_up", etc.
    - segmentA: Length of main straight segment in cm
    - hookStart: Length of start hook in cm (if visible)
    - hookEnd: Length of end hook in cm (if visible)
    
  - supports: Array of support points (pillars/columns represented by vertical lines) if visible:
    - label: Support label/name (e.g. P1, P2)
    - position: Center position from start in cm
    - width: Support width in cm
    - leftGap: Gap without stirrups to the left of support (cm)
    - rightGap: Gap without stirrups to the right of support (cm)
    
  - startGap: Gap without stirrups at start of beam (cm)
  - endGap: Gap without stirrups at end of beam (cm)

  IMPORTANT:
  1. Extract ALL bars described in the drawing.
  2. Map "bottom" bars (Principal hooks usually pointing UP) and "top" bars (Porta-estribo hooks usually pointing DOWN).
  3. Be precise with measurements.
  4. Return ONLY valid JSON array. No text, no markdown.
  `;

    const body = {
        contents: [{
            parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type || 'image/jpeg', data: base64Image } }
            ]
        }]
    };

    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-pro-vision"
    ];

    let lastError: any;

    for (const model of models) {
        try {
            console.log(`Tentando modelo: ${model}...`);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const err = await response.json();
                const msg = err.error?.message || "Erro desconhecido";
                // Se for erro de modelo não encontrado, tenta o próximo
                if (msg.includes("not found") || msg.includes("not supported")) {
                    console.warn(`Modelo ${model} falhou: ${msg}`);
                    lastError = new Error(msg);
                    continue;
                }
                throw new Error(msg); // Outros erros (auth, cota) param tudo
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("IA retornou resposta vazia");

            return parseGeminiResponse(text);

        } catch (error) {
            console.warn(`Erro no modelo ${model}:`, error);
            lastError = error;
            // Se não for erro de fetch, talvez deva tentar o próximo, mas assumimos que erro de rede = falha
            if ((error as Error).message.includes("not found")) continue;
            // Se for outro erro, continua tentando outros modelos apenas se for erro de API específico
            continue;
        }
    }

    throw lastError || new Error("Nenhum modelo disponível funcionou.");
};
