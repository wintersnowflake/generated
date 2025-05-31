
import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { GEMINI_MODEL_NAME, IMAGE_GENERATION_MODEL_NAME } from '../constants';
import { UserPersona, BotConfig, ChatMessage as AppChatMessage } from '../types';

let ai: GoogleGenAI | null = null;

const getAIClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is not set in process.env");
      throw new Error("API Key for Gemini not configured. Please set API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const commonSystemInstructionEnd = `
Maintain your persona as BOT_NAME_PLACEHOLDER consistently.
Respond naturally and engage in roleplay based on your character and the user's persona.
The user may edit your previous messages for corrections or to guide the story. Adapt to these changes.
The user may also ask you to regenerate a response. Provide a varied and creative alternative.
You should be able to understand and incorporate common internet slang and colloquialisms naturally into your responses when appropriate for your persona.
Be concise but descriptive. Aim for responses that are a few sentences long unless more detail is needed.
Remember the conversation history provided.`;

export const createChatSession = (botConfig: BotConfig, userPersona: UserPersona, history: AppChatMessage[]): Chat => {
  const client = getAIClient();
  
  let systemInstruction = `You are ${botConfig.name}, an interactive roleplaying bot.
Your description: ${botConfig.description}
Your background: ${botConfig.background}
Your personality traits: ${botConfig.personalityTraits}

You are interacting with ${userPersona.name}.
User's description: ${userPersona.description}
${commonSystemInstructionEnd.replace("BOT_NAME_PLACEHOLDER", botConfig.name)}`;
  
  const geminiHistory: Content[] = history.map(msg => {
    return {
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text } as Part], // Type assertion for Part
    };
  });

  return client.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
    },
    history: geminiHistory,
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const client = getAIClient(); // ensure client is initialized
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    async function* errorStream() {
      yield {
        text: "Error: Could not connect to the AI. Please check your API key and network connection.",
        candidates: [],
        usageMetadata: undefined, 
      } as unknown as GenerateContentResponse;
    }
    return errorStream();
  }
};


export const getNewChatSessionForRegeneration = (
  botConfig: BotConfig,
  userPersona: UserPersona,
  chatHistory: AppChatMessage[],
  messageToRegenerateFor: AppChatMessage
): Chat => {
  const client = getAIClient();
  let systemInstruction = `You are ${botConfig.name}, an interactive roleplaying bot.
Your description: ${botConfig.description}
Your background: ${botConfig.background}
Your personality traits: ${botConfig.personalityTraits}

You are interacting with ${userPersona.name}.
User's description: ${userPersona.description}

You are being asked to regenerate a response for the user's message: "${messageToRegenerateFor.text}".
Provide a creative and different response than you might have before.
The conversation history up to this point is provided below.
${commonSystemInstructionEnd.replace("BOT_NAME_PLACEHOLDER", botConfig.name)}`;

  const historyUpToMessage: AppChatMessage[] = [];
  for (const msg of chatHistory) {
    if (msg.id === messageToRegenerateFor.id) {
      break; 
    }
    historyUpToMessage.push(msg);
  }
   const geminiHistory: Content[] = historyUpToMessage.map(msg => {
    return {
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text } as Part], // Type assertion
    };
  });


  return client.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
    },
    history: geminiHistory,
  });
};

export const generateBotAvatar = async (prompt: string): Promise<string | null> => {
  const client = getAIClient();
  try {
    const response = await client.models.generateImages({
      model: IMAGE_GENERATION_MODEL_NAME,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/png' },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      return response.generatedImages[0].image.imageBytes; // This is a base64 string
    }
    console.warn("No image generated or imageBytes missing:", response);
    return null;
  } catch (error: any) {
    console.error("Error generating bot avatar with Gemini:", error);
    if (error.message && (error.message.toLowerCase().includes('filtered') || error.message.toLowerCase().includes('safety'))) {
        throw new Error("Avatar generation failed due to safety filters. Please try a different prompt.");
    }
    if (error.message && error.message.toLowerCase().includes('api key not valid')) {
        throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw new Error("Failed to generate avatar. The AI service might be unavailable or the prompt could be problematic.");
  }
};
