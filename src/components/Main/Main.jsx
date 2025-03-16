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
} from "lucide-react";
import "./Main.css";
import { Context } from "../../context/Context.jsx";

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
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
  }, [input, onSent]);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <main className="main">
      <nav className="nav">
        <p tabIndex={0}>SukhMind AI</p>
      </nav>
      <div className="main-container">
        {!showResult ? (
          <>
            <div className="greet">
              <p>
                <span>Hello, how are you feeling today?</span>
              </p>
              <p>I'm here to listen and support you.</p>
            </div>
            <div className="cards">
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
                <button
                  key={index}
                  className="card"
                  onClick={() => onSent(text)} // Pass text directly to onSent
                  aria-label={text}
                  disabled={loading}
                >
                  <p>{text}</p>
                  <div className="icon">{icon}</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div
            className="result"
            ref={resultRef}
            aria-live="polite"
            role="alert"
          >
            <div className="result-title">
              <div className="user-title-icon">
                <User size={20} />
              </div>
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              <div className="result-data-icon">
                <Brain size={20} />
              </div>
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p
                  dangerouslySetInnerHTML={{
                    __html: resultData,
                  }}
                ></p>
              )}
            </div>
          </div>
        )}
        <div className="main-bottom">
          <div className="search-box">
            <textarea
              rows={rows}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyUp}
              value={input}
              placeholder="How can I support you today?"
              aria-label="Enter your message"
            />
            <div className="icon-container">
              <button
                type="submit"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="bottom-info">
            SukhMind AI is here to support you but is not a replacement for
            professional help. If you're in crisis, please seek professional
            assistance.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Main;
