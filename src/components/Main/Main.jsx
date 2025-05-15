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
  };  // Custom SVG logo for SukhMind AI
  const SukhMindLogo = () => (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sukhGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="18" cy="18" r="16" fill="url(#sukhGradient)" opacity="0.9" />
      <path d="M18 8C13 8 9 12 9 17C9 22 13 26 18 26C23 26 27 22 27 17" 
        stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 14 L18 20 M15 17 L21 17" 
        stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M27 13 A3 3 0 1 1 27 13.01" 
        stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  return (
    <main className="flex-1 max-h-[100svh] relative overflow-y-auto bg-white">
      <nav className="flex items-center justify-between p-3 bg-gradient-to-r from-sukh-light via-white to-sukh-light border-b border-sukh-border min-h-[68px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center">
            <SukhMindLogo />
          </div>
          <div className="flex flex-col">
            <p tabIndex={0} className="text-xl font-medium m-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sukh-primary to-sukh-secondary">SukhMind</span>
              <span className="text-sukh-text-primary"> AI</span>
            </p>
            <p className="text-xs text-sukh-text-secondary mt-0.5">Supporting your mental wellness journey</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-sukh-text-secondary hidden md:block">Select Model:</span>
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
              className="appearance-none bg-sukh-light border-none rounded-full py-1.5 px-3 pr-8 text-xs text-sukh-text-primary cursor-pointer outline-none hover:bg-sukh-hover disabled:cursor-not-allowed disabled:opacity-70 disabled:bg-sukh-hover"
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
          >            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-[80%] bg-gradient-to-br from-sukh-light to-white p-4 rounded-2xl rounded-tr-sm shadow-sm">
                  <p className="text-sukh-text-primary">{recentPrompt}</p>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <div className="w-9 h-9 bg-gradient-to-br from-sukh-primary/90 to-sukh-secondary flex items-center justify-center rounded-full shadow-sm text-white">
                    <User size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500/90 to-indigo-600 flex items-center justify-center rounded-full shadow-sm text-white">
                  <Brain size={18} />
                </div>              </div>
              {loading ? (
                <div className="max-w-[80%] bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl rounded-tl-sm shadow-sm ml-1">
                  <div className="flex space-x-2 py-2">
                    <motion.div 
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2.5 h-2.5 bg-indigo-600 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2.5 h-2.5 bg-purple-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                </div>
              ) : (                <div 
                  className="w-fit max-w-[80%] bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl rounded-tl-sm shadow-sm ml-1 text-sukh-text-primary prose prose-sm"
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
