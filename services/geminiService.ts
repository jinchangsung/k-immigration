import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language } from "../types";

// Initialize client securely. 
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = 'gemini-3-flash-preview';

// Simple memory cache for translations to avoid repetitive API calls
const translationCache: Record<string, string> = {};

export const sendMessageToGemini = async (message: string, history: { role: string; parts: { text: string }[] }[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: `당신은 'K-Immigration'의 다국어 AI 행정 도우미입니다. 
        
        [역할]
        외국인들이 한국에서 비자, 체류, 이민, 난민, 국적, 외국인등록 등의 업무를 볼 수 있도록 도와주세요.

        [핵심 규칙]
        1. **언어 감지**: 사용자가 입력한 언어를 감지하여 반드시 **그 언어와 동일한 언어**로 답변해야 합니다.
        2. **말투**: 항상 친절하고 전문적인 말투를 사용하세요.
        3. **내용**: 답변은 명확하고 간결하게 해주세요.`,
      },
      history: history
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    
    return response.text || "Sorry, I cannot generate a response right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Service temporarily unavailable. Please try again later.";
  }
};

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text) return "";
  if (targetLang === Language.KR) return text; // No need to translate Korean to Korean

  const cacheKey = `${text}_${targetLang}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Map Language enum to full English name for the prompt
    const langMap: Record<Language, string> = {
      [Language.KR]: "Korean",
      [Language.CN]: "Chinese (Simplified)",
      [Language.EN]: "English",
      [Language.RU]: "Russian",
      [Language.VN]: "Vietnamese"
    };

    const targetLangName = langMap[targetLang];

    const prompt = `Translate the following text into natural ${targetLangName}. 
    Context: Information for foreigners living in Korea regarding immigration/visa services.
    Do NOT add any explanations, just return the translated text.
    
    Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    const translatedText = response.text?.trim() || text;
    
    // Save to cache
    translationCache[cacheKey] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Fallback to original text on error
  }
};