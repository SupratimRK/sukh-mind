import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";


const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set in the environment variables.");
  // handle the missing API key appropriately, show an error to the user
}

const genAI = new GoogleGenerativeAI(apiKey || "MISSING_API_KEY");
  
// Define available models; you can add or remove models as needed
// I am testing with gemini v1 models, you can add v2 models as well
// add  according to your needs
export const availableModels = [
  { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro" },
  { id: "gemini-1.5-flash-latest", name: "Gemini 1.5 Flash" },
  // experimental models
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)" },
  { id: "gemini-2.0-flash-thinking-exp-01-21", name: "Gemini 2.0 Think Flash (Experimental)" },
  { id: "gemini-2.5-pro-exp-03-25", name: "Gemini 2.5 Pro (Experimental)" },
];

// Helper function to format model names for display
export const formatModelName = (modelName) => {
  return modelName
    .replace("Gemini ", "")
    .replace(" (Experimental)", " (exp)");
};

// Function to fetch available models dynamically from the API
export const fetchAvailableModels = async () => {
  if (!apiKey) {
    console.error("API Key is missing. Cannot fetch models.");
    return []; // Or throw an error
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Ensure data.models exists and is an array before mapping
    if (data && Array.isArray(data.models)) {
      return data.models.map(model => ({
        id: model.name.startsWith("models/") ? model.name.substring("models/".length) : model.name, // Extract ID from "models/model-id"
        name: model.displayName || model.name,
      }));
    } else {
      console.error("Fetched data does not contain a models array:", data);
      return []; // Or throw an error
    }
  } catch (error) {
    console.error("Error fetching available models:", error);
    return []; // Or throw an error, or return a default/fallback list
  }
};

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// system instruction
const defaultSystemInstruction = "You are Sukh-Mind, an AI chatbot. Your goal is to offer empathetic emotional support, stress management techniques, and well-being tips. Maintain a calm, supportive tone. If a user expresses crisis or self-harm intent, provide crisis hotline resources, and strongly urge professional help. When a user greets you, tell who you are and ask how they are feeling. If a user asks for a specific topic, provide information and resources. Always prioritize user safety and well-being.";

// modified the run function to accept modelName and systemInstruction
async function run(prompt, modelName = availableModels[0].id, systemInstruction = defaultSystemInstruction) { // default is the first model and default instruction
  if (!apiKey) {
    return "API Key is missing. Please configure it in your environment variables. Get it from https://aistudio.google.com/u/1/apikey";
  }
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      // system instruction added
      systemInstruction: systemInstruction, 
    }); 

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error.message.includes("API key not valid")) {
        return "API Key is invalid. Please check your configuration.";
    }
    if (error.message.includes("quota")) {
        return "API quota exceeded. Please check your usage or billing.";
    }
    return `An error occurred while contacting the AI model: ${error.message}`;
  }
}

export default run;
