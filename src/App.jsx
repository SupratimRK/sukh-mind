import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import Main from "./components/Main/Main.jsx";

const App = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  return (
    <AnimatePresence>
      <motion.div
        className="flex w-full bg-gemini-main dark:text-gemini-text-primary min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Sidebar />
        <Main />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
