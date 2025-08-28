import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const POLLING_INTERVAL_MS = 10000;

const PROMPT_SUGGESTION_SYSTEM_INSTRUCTION = `You are an expert video director and prompt engineer. Your goal is to take a user's simple idea and expand it into three distinct, highly detailed, and creative prompts for a video generation AI. Each prompt should be a single paragraph and focus on visual details, camera movements, lighting, and mood. If an image is provided, your suggestions MUST be based on the visual content, style, and mood of the image, incorporating the user's text idea. Provide your response as a JSON object with a single key "prompts" which contains an array of three string prompts.`;

export const generatePromptSuggestions = async (
  idea: string,
  image?: { imageBytes: string; mimeType: string; }
): Promise<string[]> => {
  if (!idea.trim() && !image) {
    return [];
  }
  try {
    let promptText = 'Generate 3 video prompts.';
    if (idea.trim()) {
      promptText += ` The user's idea is: "${idea.trim()}".`;
    }
    if (image) {
      promptText += ' Base your suggestions on the provided image.';
    }
    
    const textPart = { text: promptText };
    const imagePart = image ? { inlineData: { data: image.imageBytes, mimeType: image.mimeType } } : null;

    const contents = imagePart ? { parts: [textPart, imagePart] } : textPart.text;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: PROMPT_SUGGESTION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompts: {
              type: Type.ARRAY,
              description: "An array of 3 distinct, creative, and detailed video prompt suggestions.",
              items: {
                type: Type.STRING,
                description: "A single paragraph video prompt."
              }
            }
          },
          required: ["prompts"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
      return parsed.prompts;
    } else {
      throw new Error("Invalid response format from prompt suggestion API.");
    }
  } catch (error: any) {
    console.error("Error generating prompt suggestions:", error);
    throw new Error(error.message || "Failed to generate prompt suggestions.");
  }
};


export const generateVideo = async (
  prompt: string,
  image?: { imageBytes: string; mimeType: string; },
  aspectRatio?: AspectRatio
): Promise<string> => {
  try {
    const request = {
      model: 'veo-2.0-generate-001',
      prompt,
      config: {
        numberOfVideos: 1,
        ...(aspectRatio && { aspectRatio }),
      },
      ...(image && { image })
    };

    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video generation completed, but no download link was found.");
    }

    console.log("Debugging: Raw video download link from API:", downloadLink);

    try {
        const fetchUrl = `${downloadLink}&key=${process.env.API_KEY}`;
        console.log("Debugging: Attempting to fetch from full URL:", fetchUrl);

        const videoResponse = await fetch(fetchUrl);
        if (!videoResponse.ok) {
            const errorBody = await videoResponse.text();
            console.error("Video download failed with status:", videoResponse.status, "Body:", errorBody);
            let detail = "";
            if (errorBody) {
                try {
                    const errorJson = JSON.parse(errorBody);
                    detail = errorJson.error?.message || errorBody;
                } catch (e) {
                    detail = errorBody;
                }
            }
            
            let userMessage = `Failed to download video. Server responded with status ${videoResponse.status}.`;
            if (detail) {
                userMessage += ` Detail: ${detail}`;
            } else if (videoResponse.status === 400) {
                userMessage += " This may be due to an invalid request or API key restrictions (like HTTP referrers). Please check your key configuration and the request parameters.";
            } else if (videoResponse.status === 403) {
                userMessage += " This indicates an issue with API key permissions. Please verify your key's restrictions in the Google Cloud console.";
            }
        
            throw new Error(userMessage);
        }
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (fetchError: any) {
        console.error("Error fetching video from download link:", fetchError);
        // Re-throw specific, user-friendly messages for common network errors
        if (fetchError instanceof Error && fetchError.message.startsWith('Failed to download video')) {
            throw fetchError;
        }
        throw new Error("Failed to download video, likely due to a network issue or API key restrictions (like HTTP referrers on your production domain). Please verify your API key configuration in the Google Cloud console and check the browser's network console for more details.");
    }

  } catch (error: any) {
    console.error("Error in generateVideo service:", error);
    throw new Error(error.message || "Failed to generate video due to an API error.");
  }
};