import { createContext, useState, useCallback } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = ({ children }) => {
  // State for managing user input and chat history
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);

  // State for managing chat responses and UI state
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  /**
   * Function to add a delay effect for displaying response words smoothly
   */
  const typeText = useCallback((words, index = 0) => {
    if (index < words.length) {
      setResultData((prev) => prev + words[index] + " ");
      setTimeout(() => {
        requestAnimationFrame(() => typeText(words, index + 1));
      }, 50); // Reduced delay for a better typing effect
    }
  }, []);

  /**
   * Function to handle new chat creation
   */
  const newChat = () => {
    setLoading(false);
    setShowResult(false);
    setResultData("");
  };

  /**
   * Function to send the user input and get a response
   */
  const onSent = async (prompt) => {
    setResultData(""); // Reset response data
    setLoading(true);
    setShowResult(true);

    const userPrompt = prompt ?? input; // Use the argument if provided
    if (!prompt) {
      setPrevPrompts((prev) => [...prev, input]);
    }
    setRecentPrompt(userPrompt);

    try {
      const response = await runChat(userPrompt);
      processResponse(response);
    } catch (error) {
      console.error("Error fetching response:", error);
      setResultData("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  /**
   * Function to process and format the AI response
   */
  const processResponse = (response) => {
    if (!response) return;

    let formattedResponse = response
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Format bold text (**bold**)
      .replace(/\n/g, "<br/>"); // Replace new lines (\n) with <br/>

    // Split the formatted response into words for smooth typing animation
    const words = formattedResponse.split(" ");
    typeText(words);
  };

  // Context value to be provided to children components
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
  };

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export default ContextProvider;
