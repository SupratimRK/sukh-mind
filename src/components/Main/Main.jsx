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

  // Animation variants
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

  return (
    <main className="flex-1 max-h-[100svh] relative overflow-y-auto bg-white">
      <nav className="flex items-center justify-between p-4 bg-white border-b border-sukh-border min-h-[60px] shadow-sm">
        <div className="flex flex-col items-start">
          <p tabIndex={0} className="text-xl text-sukh-text-primary font-normal m-0">SukhMind AI</p>
          <div className="mt-1">
            {modelsLoading ? (
              <div className="flex items-center gap-1.5 text-xs py-1 px-3 bg-sukh-light rounded-full text-sukh-text-secondary">
                <LoaderCircle size={14} className="animate-spin" />
                <span>Loading models...</span>
              </div>
            ) : modelsError ? (
              <div className="flex items-center gap-1.5 text-xs py-1 px-3 bg-sukh-light rounded-full text-amber-600">
                <AlertTriangle size={14} />
                <span title={modelsError}>Using default models</span>
              </div>
            ) : (
              <select
                id="model-select-main"
                value={selectedModel}
                onChange={handleModelChange}
                disabled={loading}
                aria-label="Select AI Model"
                className="appearance-none bg-sukh-light border-none rounded-full py-1 px-3 pr-8 text-xs text-sukh-text-primary cursor-pointer outline-none hover:bg-sukh-hover disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-sukh-hover"
                style={{
                  backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%235f6368" viewBox="0 0 16 16"><path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px 12px'
                }}
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {formatModelName(model.name)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </nav>
      
      <div className="p-4 md:p-6 h-[calc(100vh-140px)] overflow-y-auto">
        {!showResult ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center h-full"
          >
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.p 
                className="text-2xl font-medium mb-2 bg-gradient-to-r from-sukh-primary to-sukh-secondary inline-block text-transparent bg-clip-text"
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [1, 0.95, 1] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Hello, how are you feeling today?
              </motion.p>
              <p className="text-sukh-text-secondary">I'm here to listen and support you.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
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
              ].map(({ text, icon }, index) => (                <motion.button
                  key={index}
                  variants={cardHoverEffect}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  animate="rest"
                  className="flex items-center justify-between p-4 bg-white hover:bg-sukh-light rounded-xl border border-sukh-border shadow-card transition-all"
                  onClick={() => onSent(text)}
                  aria-label={text}
                  disabled={loading}
                >
                  <p className="text-sukh-text-primary text-left font-medium">{text}</p>
                  <div className="text-sukh-primary">{icon}</div>
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
              className="mb-8"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-sukh-light rounded-full text-sukh-primary mt-1">
                  <User size={18} />
                </div>
                <p className="mt-1.5 text-sukh-text-primary">{recentPrompt}</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="p-2 bg-sukh-light rounded-full text-sukh-secondary mt-1">
                <Brain size={18} />
              </div>
              {loading ? (
                <div className="flex space-x-2 mt-3">
                  <motion.div 
                    className="w-2.5 h-2.5 bg-sukh-primary rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2.5 h-2.5 bg-sukh-secondary rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2.5 h-2.5 bg-sukh-primary rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                  />
                </div>
              ) : (
                <div 
                  className="mt-1.5 text-sukh-text-primary prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: resultData,
                  }}
                />
              )}
            </motion.div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-sukh-border p-4 pb-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="relative mx-auto max-w-3xl">
          <textarea
            rows={rows}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyUp}
            value={input}
            placeholder="How can I support you today?"
            aria-label="Enter your message"
            className="w-full p-3.5 pr-16 border border-sukh-border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-sukh-primary/30 focus:border-sukh-primary transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              aria-label="Voice input"
              className="p-2 text-sukh-text-secondary hover:text-sukh-primary transition-colors"
            >
              <Mic size={20} />
            </button>
            <button
              type="submit"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="p-2 text-white bg-sukh-primary hover:bg-opacity-90 disabled:bg-sukh-text-muted disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        <p className="text-xs text-sukh-text-muted text-center mt-3 max-w-3xl mx-auto">
          SukhMind AI is here to support you but is not a replacement for
          professional help. If you're in crisis, please seek professional
          assistance.
        </p>
      </div>
    </main>
  );
};

export default Main;
