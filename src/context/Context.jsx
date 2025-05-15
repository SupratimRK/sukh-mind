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
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);

  // Fetch models on component mount
  useEffect(() => {
    const getModels = async () => {
      try {
        const fetchedModels = await fetchAvailableModels();
        if (fetchedModels && fetchedModels.length > 0) {
          setDynamicModels(fetchedModels);
          // Set the first fetched model as selected if we have fetched models
          setSelectedModel(fetchedModels[0].id);
        } else {
          // Fallback to hardcoded models if API returns empty
          setDynamicModels(availableModels);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelsError("Failed to load available models. Using default models instead.");
        setDynamicModels(availableModels);
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
