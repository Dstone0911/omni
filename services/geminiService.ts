
import { GoogleGenAI } from "@google/genai";

// Initializing the Gemini API client using the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAbstractRoute = async (
  fromChain: string,
  toChain: string,
  token: string,
  amount: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a cross-chain infrastructure expert. Analyze the security and efficiency of bridging ${amount} ${token} from ${fromChain} to ${toChain}. 
      Focus on interoperability protocols like LayerZero, Across, and Tenderly Virtual Networks. 
      Identify potential security risks (slippage, re-entrancy in bridge contracts) and suggest the most abstract path that minimizes user friction.
      Provide the response in a structured markdown format.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Analysis unavailable. Please check connectivity.";
  }
};
