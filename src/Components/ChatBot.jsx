import React, { useState } from "react";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your FreshBasket AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful AI assistant for FreshBasket." },
          ...messages,
          { role: "user", content: userMessage }
        ],
      });

      const reply = response.choices[0].message.content;

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again later." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Hi! I'm your FreshBasket AI assistant. How can I help you today?" }
    ]);
  };

  return (
    <div>
      {/* Floating button */}
      <button
  onClick={() => setOpen(!open)}
  className="fixed bottom-5 right-10  hover:bg-blue-700 text-white p-4  shadow-lg transition-colors z-50"
  aria-label="Toggle chat"
>
  {open ? (
    "✕"
  ) : (
    <img
      width={60}
      height={60}
      src="https://img.icons8.com/3d-fluency/94/speech-bubble-with-dots.png"
      alt="speech-bubble-with-dots"
    />
  )}
</button>


      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 z-40">
          {/* Header */}
          <div className="bg-green-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">FreshBasket Assistant</h3>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-white hover:text-gray-200 text-sm"
                title="Clear chat"
              >
                <img width="25" height="25" src="https://img.icons8.com/windows/32/waste.png" alt="waste"/>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white hover:text-gray-200"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Type your message..."
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask me about products, orders, or delivery!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
