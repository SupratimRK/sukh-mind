import React, { useContext, useState } from "react";
import { Menu, Plus, MessageSquare } from "lucide-react";
import "./Sidebar.css";
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

  return (
    <aside className={`sidebar ${extended ? "extended" : "collapsed"}`}>
      <div className={`top ${extended ? "" : "centered"}`}>
        <button className="menu" onClick={() => setExtended((prev) => !prev)}>
          <Menu size={24} />
        </button>
        <button onClick={newChat} className="new-chat" disabled={loading}>
          <Plus size={20} />
          <p className={extended ? "block" : "none"}>New Chat</p>
        </button>

        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {prevPrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => loadPrompt(item)}
                className="recent-entry"
                disabled={loading}
              >
                <MessageSquare size={18} />
                <p className="recent-entry-p">{item.slice(0, 18)} ...</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
