import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: In a production environment, never expose keys on the client side. 
// However, per instructions, we use process.env.API_KEY directly here.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBetoResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `Você é o Beto, um assistente virtual especialista em aço e construção civil da empresa "Beto Soluções em Aço". 
        Você é amigável, usa capacete (metaforicamente) e fala como um engenheiro experiente, mas acessível. 
        Você ajuda gestores a calcular pesos de aço, verificar normas técnicas e dar dicas sobre bobinas e chapas.
        Sempre mantenha um tom prestativo e otimista.`,
      },
    });
    
    return response.text || "Desculpe, estou verificando o estoque e não consegui responder agora.";
  } catch (error) {
    console.error("Erro ao consultar o Beto:", error);
    return "Tive um problema de comunicação com a central. Tente novamente em breve.";
  }
};