import React, { useContext, useState } from "react";
import { Menu, Plus, MessageSquare, Heart, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Context } from "../../context/Context";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const {
    onSent,
    prevPrompts,
    setRecentPrompt,
    newChat,
    loading,
  } = useContext(Context);

  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    await onSent(prompt);
  };

  const sidebarVariants = {
    collapsed: { width: "80px" },
    extended: { width: "240px" }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.aside
      className="min-h-screen flex-col justify-between bg-sukh-light py-4 px-2.5 z-50 select-none fixed md:relative shadow-md hidden sm:flex"
      animate={extended ? "extended" : "collapsed"}
      variants={sidebarVariants}
      initial="collapsed"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4 pl-2">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-sukh-hover transition-colors"
            onClick={() => setExtended((prev) => !prev)}
          >
            <Menu size={22} className="text-sukh-text-primary" />
          </button>
        </div>
        
        <motion.button
          onClick={newChat}
          className={`flex items-center gap-3 py-2.5 px-4 rounded-full bg-sukh-primary hover:bg-opacity-90 transition-colors text-white mb-4 ${extended ? "mx-2" : "mx-auto justify-center w-12 h-12"}`}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          {extended && <span className="text-sm font-medium">New Chat</span>}
        </motion.button>
        
        <motion.button
          className={`flex items-center gap-3 py-2.5 px-4 rounded-full hover:bg-sukh-hover transition-colors text-sukh-text-primary ${extended ? "mx-2" : "mx-auto justify-center w-12 h-12"}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Heart size={20} className="text-sukh-primary" />
          {extended && <span className="text-sm">Wellness Resources</span>}
        </motion.button>

        {/* recent sec */}
        {extended && (
          <div className="mt-6 px-4">
            <p className="text-sukh-text-secondary text-sm font-medium mb-3">Recent</p>
            <motion.div 
              className="flex flex-col gap-1"
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.05 }}
            >
              {prevPrompts.length > 0 ? 
                prevPrompts.map((item, index) => (
                  <motion.button
                    key={index}
                    variants={listItemVariants}
                    onClick={() => loadPrompt(item)}
                    className="flex items-start gap-3 p-2 text-left rounded-md hover:bg-sukh-hover w-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    <MessageSquare size={16} className="text-sukh-text-secondary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-sukh-text-primary truncate pr-2">{item}</p>
                  </motion.button>
                ))
                : 
                <p className="text-xs text-sukh-text-muted py-2">No recent conversations</p>
              }
            </motion.div>
          </div>
        )}
      </div>
      
      {/* settings - dummy */}
      <div className="mt-auto">
        <motion.button 
          className={`flex items-center gap-3 py-2.5 px-4 rounded-full hover:bg-sukh-hover transition-colors text-sukh-text-primary mb-2 ${extended ? "mx-2" : "mx-auto justify-center w-12 h-12"}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings size={20} />
          {extended && <span className="text-sm">Settings</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
