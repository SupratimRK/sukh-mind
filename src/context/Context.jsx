import { createContext, useState, useCallback, useEffect } from "react";

import runChat, { availableModels, fetchAvailableModels } from "../config/gemini";

export const Context = createContext();

const ContextProvider = ({ children }) => {

  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);

  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  // Model states for dynamic fetching
  const [dynamicModels, setDynamicModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);
  
  // Find the newest Flash model in the available models array
  const findFlashModel = (models) => {
    // First check for models newer than 2.0 (like 2.5, 3.0, etc.)
    let newestModel = models.find(model => {
      const modelName = model.name?.toLowerCase() || model.id.toLowerCase();
      // Look for newer Flash models first
      return (modelName.includes('flash') && 
              (modelName.includes('gemini-3') || 
               modelName.includes('gemini-2.5')));
    });
    
    if (!newestModel) {
      // If no newer Flash models, look for 2.0 Flash
      newestModel = models.find(model => 
        (model.id.toLowerCase().includes('gemini-2.0-flash') || 
        (model.name?.toLowerCase().includes('2.0') && 
         model.name?.toLowerCase().includes('flash')))
      );
    }

    if (!newestModel) {
      // If still not found, get any Flash model
      const flashModels = models.filter(model => 
        model.id.toLowerCase().includes('flash') || 
        (model.name?.toLowerCase()?.includes('flash'))
      );
      
      if (flashModels.length > 0) {
        // Get the last flash model in the list (newest)
        newestModel = flashModels[flashModels.length - 1];
      }
    }
    
    // If found, return it, otherwise return the first model in the list
    return newestModel ? newestModel.id : (models.length > 0 ? models[0].id : availableModels[0].id);
  };

  // Initialize with default model
  const [selectedModel, setSelectedModel] = useState(findFlashModel(availableModels));

  // Fetch models on component mount
  useEffect(() => {
    const getModels = async () => {
      try {
        const fetchedModels = await fetchAvailableModels();
        if (fetchedModels && fetchedModels.length > 0) {
          setDynamicModels(fetchedModels);
          // Select the latest Flash model if available
          setSelectedModel(findFlashModel(fetchedModels));
        } else {
          // Fallback to hardcoded models if API returns empty
          setDynamicModels(availableModels);
          setSelectedModel(findFlashModel(availableModels));
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelsError("Failed to load available models. Using default models instead.");
        setDynamicModels(availableModels);
        setSelectedModel(findFlashModel(availableModels));
      } finally {
        setModelsLoading(false);
      }
    };

    getModels();
  }, []);

  const typeText = useCallback((words, index = 0) => {
    if (index < words.length) {
      setResultData((prev) => prev + words[index] + " ");
      setTimeout(() => {
        requestAnimationFrame(() => typeText(words, index + 1));
      }, 50);
    }
  }, []);

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    const userPrompt = prompt ?? input;
    if (!prompt) {
      setPrevPrompts((prev) => [...prev, input]);
    }
    setRecentPrompt(userPrompt);

    try {
      const response = await runChat(userPrompt, selectedModel);
      processResponse(response);
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultData("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const processResponse = (response) => {
    if (!response) return;

    let formattedResponse = response
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\n/g, "<br/>");

    const words = formattedResponse.split(" ");
    typeText(words);
  };

  const contextValue = {
    input,
    setInput,
    recentPrompt,
    setRecentPrompt,
    prevPrompts,
    setPrevPrompts,
    onSent,
    newChat,
    showResult,
    loading,
    resultData,
    // Provide both the dynamic models and their loading/error state
    availableModels: dynamicModels.length > 0 ? dynamicModels : availableModels,
    modelsLoading,
    modelsError,
    selectedModel,
    setSelectedModel,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
