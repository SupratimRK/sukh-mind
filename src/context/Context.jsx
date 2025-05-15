import { createContext, useState, useCallback, useEffect } from "react";

import runChat, { availableModels, fetchAvailableModels } from "../config/gemini";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  // Load data from localStorage if available
  const getSavedData = (key, defaultValue) => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState(getSavedData("recentPrompt", ""));
  const [prevPrompts, setPrevPrompts] = useState(getSavedData("prevPrompts", []));
  
  // Add conversations to store full chat history (user messages and AI responses)
  const [conversations, setConversations] = useState(getSavedData("conversations", []));

  const [showResult, setShowResult] = useState(getSavedData("showResult", false));
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(getSavedData("resultData", ""));

  const [dynamicModels, setDynamicModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("prevPrompts", JSON.stringify(prevPrompts));
  }, [prevPrompts]);

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("recentPrompt", JSON.stringify(recentPrompt));
  }, [recentPrompt]);

  useEffect(() => {
    localStorage.setItem("resultData", JSON.stringify(resultData));
  }, [resultData]);

  useEffect(() => {
    localStorage.setItem("showResult", JSON.stringify(showResult));
  }, [showResult]);

  const findFlashModel = (models) => {

    const getVersionNumber = (model) => {
      const modelNameOrId = (model.name?.toLowerCase() || model.id.toLowerCase());

      const versionMatch = modelNameOrId.match(/gemini-(\d+\.\d+)/);
      return versionMatch ? parseFloat(versionMatch[1]) : 0;
    };


    const modernModels = models.filter(model => {
      const version = getVersionNumber(model);
      return version >= 2.0;
    });


    const filteredModels = modernModels.length > 0 ? modernModels : models;


    const flashModels = filteredModels.filter(model => {
      const modelNameOrId = (model.name?.toLowerCase() || model.id.toLowerCase());
      return modelNameOrId.includes('flash');
    });

    if (flashModels.length === 0) {

      const selectedId = filteredModels.length > 0 ? filteredModels[0].id : availableModels[0].id;
      console.info(`No Flash models found, using ${selectedId}`);
      return selectedId;
    }


    const sortedFlashModels = [...flashModels].sort((a, b) => {
      return getVersionNumber(b) - getVersionNumber(a);
    });


    console.info("Available Flash models (sorted by version):",
      sortedFlashModels.map(m => `${m.id} (v${getVersionNumber(m)})`).join(', '));


    const thinkingFlashModel = sortedFlashModels.find(model => {
      const modelNameOrId = (model.name?.toLowerCase() || model.id.toLowerCase());
      return modelNameOrId.includes('think');
    });


    const selectedId = thinkingFlashModel ? thinkingFlashModel.id : sortedFlashModels[0].id;
    console.info(`Selected model: ${selectedId} ${thinkingFlashModel ? '(thinking capable)' : '(highest version)'}`);
    return selectedId;
  };


  const [selectedModel, setSelectedModel] = useState(getSavedData("selectedModel", findFlashModel(availableModels)));
  
  // Save selectedModel to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedModel", JSON.stringify(selectedModel));
  }, [selectedModel]);

  useEffect(() => {
    const getModels = async () => {
      try {
        const fetchedModels = await fetchAvailableModels();
        if (fetchedModels && fetchedModels.length > 0) {
          console.info(`Loaded ${fetchedModels.length} Gemini models v2.0+:`,
            fetchedModels.map(m => m.id).join(', '));

          setDynamicModels(fetchedModels);

          // Check if the user's previously selected model is available
          const savedModel = getSavedData("selectedModel", null);
          if (savedModel && fetchedModels.some(model => model.id === savedModel)) {
            console.info(`Using previously selected model: ${savedModel}`);
            // User's previously selected model is available, keep using it
          } else {
            // No saved model or saved model is not available, select default
            const selectedFlashModelId = findFlashModel(fetchedModels);
            console.info(`Selected model: ${selectedFlashModelId} (no valid saved preference found)`);
            setSelectedModel(selectedFlashModelId);
          }
        } else {

          console.warn('No Gemini v2.0+ models returned from API. Using fallback models.');
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
    setRecentPrompt("");
    // We don't clear prevPrompts or conversations here to maintain chat history
    // Just reset the current chat state to start a new conversation
    
    // Update localStorage to reflect the new chat state
    localStorage.setItem("showResult", JSON.stringify(false));
    localStorage.setItem("resultData", JSON.stringify(""));
    localStorage.setItem("recentPrompt", JSON.stringify(""));
  };

  const clearChatHistory = useCallback(() => {
    setPrevPrompts([]);
    setRecentPrompt("");
    setResultData("");
    setShowResult(false);
    setConversations([]);
    localStorage.removeItem("prevPrompts");
    localStorage.removeItem("recentPrompt");
    localStorage.removeItem("resultData");
    localStorage.removeItem("showResult");
    localStorage.removeItem("conversations");
  }, []);

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
      
      // Save the conversation with both user prompt and AI response
      setConversations(prev => [
        ...prev, 
        {
          role: "user",
          content: userPrompt,
          timestamp: new Date().toISOString()
        },
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString()
        }
      ]);
      
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
    conversations,
    setConversations,
    onSent,
    newChat,
    clearChatHistory,
    showResult,
    loading,
    resultData,

    availableModels: dynamicModels.length > 0 ? dynamicModels : availableModels,
    modelsLoading,
    modelsError,
    selectedModel,
    setSelectedModel,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
