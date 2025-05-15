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


  const [dynamicModels, setDynamicModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);

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


  const [selectedModel, setSelectedModel] = useState(findFlashModel(availableModels));

  useEffect(() => {
    const getModels = async () => {
      try {
        const fetchedModels = await fetchAvailableModels();
        if (fetchedModels && fetchedModels.length > 0) {
          console.info(`Loaded ${fetchedModels.length} Gemini models v2.0+:`,
            fetchedModels.map(m => m.id).join(', '));

          setDynamicModels(fetchedModels);


          const selectedFlashModelId = findFlashModel(fetchedModels);
          console.info(`Selected model: ${selectedFlashModelId}`);
          setSelectedModel(selectedFlashModelId);
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

    availableModels: dynamicModels.length > 0 ? dynamicModels : availableModels,
    modelsLoading,
    modelsError,
    selectedModel,
    setSelectedModel,
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
