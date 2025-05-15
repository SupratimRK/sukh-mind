import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  MessageCircle,
  Send,
  Brain,
  Lightbulb,
  Compass,
  User,
  LoaderCircle,
  AlertTriangle,
  Mic,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { Context } from "../../context/Context.jsx";
import { formatModelName } from "../../config/gemini";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
    selectedModel,
    setSelectedModel,
    availableModels,
    modelsLoading,
    modelsError,
  } = useContext(Context);
  const resultRef = useRef(null);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    const updateRows = () => setRows(window.innerWidth <= 600 ? 2 : 1);
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [resultData]);

  const handleSend = useCallback(() => {
    if (input.trim() === "") return;
    setInput("");
    onSent();
  }, [input, onSent, setInput]);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const cardHoverEffect = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };  
  const SukhMindLogo = () => (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-sukh-primary to-sukh-secondary shadow-sm">
      <Brain size={22} className="text-white" />
    </div>
  );
  return (
    <main className="flex-1 max-h-[100svh] relative overflow-y-auto bg-white">
      <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-sukh-border min-h-[60px] sm:min-h-[68px] shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-center">
            <SukhMindLogo />
          </div>
          <div className="flex flex-col">
            <p tabIndex={0} className="text-lg sm:text-xl font-medium m-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sukh-primary to-sukh-secondary">SukhMind</span>
              <span className="text-sukh-text-primary"> AI</span>
            </p>
            <p className="text-[10px] sm:text-xs text-sukh-text-secondary mt-0.5">Supporting your mental wellness journey</p>
            {/* Model selector for small screens */}
            <div className="block sm:hidden mt-2">
              <span className="text-xs text-sukh-text-secondary mr-2">Select Model:</span>
              {modelsLoading ? (
                <div className="flex items-center gap-1.5 text-[10px] py-1 px-2 gradient-capsule rounded-full text-white shadow-sm">
                  <LoaderCircle size={12} className="animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : modelsError ? (
                <div className="flex items-center gap-1.5 text-[10px] py-1 px-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-white shadow-sm">
                  <AlertTriangle size={12} />
                  <span title={modelsError}>Using default</span>
                </div>
              ) : (
                <div className="relative inline-block">
                  <select
                    id="model-select-main-mobile"
                    value={selectedModel}
                    onChange={handleModelChange}
                    disabled={loading}
                    aria-label="Select AI Model"
                    className="appearance-none gradient-capsule border-2 border-blue-300 rounded-full py-1 px-2 pr-7 text-[10px] text-blue-600 font-medium cursor-pointer outline-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
                    style={{ background: 'none' }}
                  >
                    {availableModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {formatModelName(model.name)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none text-blue-600 absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Model selector for desktop */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          <span className="text-sm text-sukh-text-secondary">Select Model:</span>
          {modelsLoading ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 gradient-capsule rounded-full text-white shadow-sm">
              <LoaderCircle size={12} className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : modelsError ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs py-1 sm:py-1.5 px-2 sm:px-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-white shadow-sm">
              <AlertTriangle size={12} />
              <span title={modelsError}>Using default</span>
            </div>
          ) : (
            <div className="relative">
              <select
                id="model-select-main"
                value={selectedModel}
                onChange={handleModelChange}
                disabled={loading}
                aria-label="Select AI Model"
                className="appearance-none gradient-capsule border-2 border-blue-300 rounded-full py-1 sm:py-1.5 px-2 sm:px-3 pr-7 text-[10px] sm:text-xs text-blue-600 font-medium cursor-pointer outline-none hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
                style={{
                  background: 'none',
                }}
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {formatModelName(model.name)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none text-blue-600 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2" />
            </div>
          )}
        </div>
      </nav>
      {/* Hide sidebar on small screens: add responsive logic in Sidebar component */}
      
      <div className="p-3 sm:p-4 md:p-6 h-[calc(100vh-130px)] sm:h-[calc(100vh-140px)] overflow-y-auto">
        {!showResult ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center h-full"
          >
            <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
              <motion.p 
                className="text-xl sm:text-2xl font-medium mb-2 bg-gradient-to-r from-sukh-primary to-sukh-secondary inline-block text-transparent bg-clip-text"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [1, 0.95, 1] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Hello, how are you feeling today?
              </motion.p>
              <p className="text-sm sm:text-base text-sukh-text-secondary">I'm here to listen and support you.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-3xl">
              {[
                {
                  text: "Guide me through a relaxation exercise",
                  icon: <Compass size={20} />,
                },
                {
                  text: "Share some positive affirmations",
                  icon: <Lightbulb size={20} />,
                },
                {
                  text: "Suggest ways to manage stress",
                  icon: <Brain size={20} />,
                },
                {
                  text: "Tell me about mindfulness meditation",
                  icon: <MessageCircle size={20} />,
                },
              ].map(({ text, icon }, index) => (
                <motion.button
                  key={index}
                  variants={cardHoverEffect}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  animate="rest"
                  className="flex items-center justify-between p-3 sm:p-4 bg-white hover:bg-sukh-light rounded-xl border border-sukh-border shadow-card transition-all"
                  onClick={() => onSent(text)}
                  aria-label={text}
                  disabled={loading}
                >
                  <p className="text-sm sm:text-base text-sukh-text-primary text-left font-medium">{text}</p>
                  <div className="text-sukh-primary ml-2">{icon}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div
            className="h-full overflow-y-auto max-w-4xl mx-auto"
            ref={resultRef}
            aria-live="polite"
            role="alert"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex items-start justify-end gap-2 sm:gap-3">
                <div className="max-w-[80%] bg-gradient-to-br from-sukh-light to-white p-3 sm:p-4 rounded-2xl rounded-tr-sm shadow-sm">
                  <p className="text-sm sm:text-base text-sukh-text-primary">{recentPrompt}</p>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-sukh-primary/90 to-sukh-secondary flex items-center justify-center rounded-full shadow-sm text-white">
                    <User size={16} className="sm:hidden" />
                    <User size={18} className="hidden sm:block" />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-2 sm:gap-3"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500/90 to-indigo-600 flex items-center justify-center rounded-full shadow-sm text-white">
                  <Brain size={16} className="sm:hidden" />
                  <Brain size={18} className="hidden sm:block" />
                </div>
              </div>
              {loading ? (
                <div className="max-w-[80%] bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-4 rounded-2xl rounded-tl-sm shadow-sm ml-1">
                  <div className="flex space-x-2 py-2">
                    <motion.div 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-600 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                </div>
              ) : (
                <div 
                  className="w-fit max-w-[80%] bg-gradient-to-br from-indigo-50 to-white p-3 sm:p-4 rounded-2xl rounded-tl-sm shadow-sm ml-1 text-sm sm:text-base text-sukh-text-primary prose prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: resultData,
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-sukh-border p-3 sm:p-4 pb-4 sm:pb-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="relative mx-auto max-w-3xl">
          <textarea
            rows={rows}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyUp}
            value={input}
            placeholder="How can I support you today?"
            aria-label="Enter your message"
            className="w-full p-3 sm:p-3.5 pr-14 sm:pr-16 border border-sukh-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-sukh-primary/30 focus:border-sukh-primary transition text-sm sm:text-base"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              aria-label="Voice input"
              className="p-1.5 sm:p-2 text-sukh-text-secondary hover:text-sukh-primary transition-colors"
            >
              <Mic size={18} className="sm:hidden" />
              <Mic size={20} className="hidden sm:block" />
            </button>
            <button
              type="submit"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-1.5 sm:p-2 text-white bg-sukh-primary hover:bg-opacity-90 disabled:bg-sukh-text-muted disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send size={18} className="sm:hidden" />
              <Send size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-sukh-text-muted text-center mt-2 sm:mt-3 max-w-3xl mx-auto">
          SukhMind AI is here to support you but is not a replacement for
          professional help. If you're in crisis, please seek professional
          assistance.
        </p>
      </div>
    </main>
  );
};

export default Main;
