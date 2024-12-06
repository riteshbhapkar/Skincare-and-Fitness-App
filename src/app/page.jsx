"use client";
import React from "react";

import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm your personal health and wellness coach. Let's start by understanding your goals. Are you interested in skincare advice, fitness guidance, or both?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [userProfile, setUserProfile] = useState({
    skinType: "",
    skinConcerns: [],
    fitnessGoals: "",
    activityLevel: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const handleFinish = useCallback((message) => {
    setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    setStreamingMessage("");
    setIsLoading(false);
  }, []);
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: handleFinish,
  });
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;

    setIsLoading(true);
    const userMsg = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    try {
      const allMessages = [
        {
          role: "system",
          content:
            "You are a helpful and knowledgeable health coach specializing in skincare and fitness. Keep responses under 200 words. Consider the user's profile - Skin Type: " +
            userProfile.skinType +
            ", Fitness Goals: " +
            userProfile.fitnessGoals +
            ", Activity Level: " +
            userProfile.activityLevel +
            ". For skincare, focus on ingredient recommendations and daily routines specific to their skin type. For fitness, provide specific exercise suggestions and form tips aligned with their goals and activity level. Always maintain a supportive, encouraging tone. When you want to emphasize text, use markdown bold with single underscores like _this_ instead of asterisks.",
        },
        ...messages,
        userMsg,
      ];

      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      await handleStreamResponse(response);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting right now. Please try again.",
        },
      ]);
      setIsLoading(false);
    }
  }, [messages, inputMessage, handleStreamResponse, userProfile]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        <div className="bg-white rounded-t-xl shadow-lg p-6 mb-4 border border-blue-100">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-crimson-text text-[#2C3E50] text-center font-bold mb-2">
            Your Personal Health Coach <span className="text-blue-500">AI</span>
          </h1>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <select
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userProfile.skinType}
              onChange={(e) =>
                setUserProfile((prev) => ({
                  ...prev,
                  skinType: e.target.value,
                }))
              }
            >
              <option value="">Select Skin Type</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="sensitive">Sensitive</option>
              <option value="normal">Normal</option>
            </select>
            <select
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userProfile.fitnessGoals}
              onChange={(e) =>
                setUserProfile((prev) => ({
                  ...prev,
                  fitnessGoals: e.target.value,
                }))
              }
            >
              <option value="">Select Fitness Goal</option>
              <option value="weightLoss">Weight Loss</option>
              <option value="muscleGain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="general">General Fitness</option>
            </select>
            <select
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userProfile.activityLevel}
              onChange={(e) =>
                setUserProfile((prev) => ({
                  ...prev,
                  activityLevel: e.target.value,
                }))
              }
            >
              <option value="">Select Activity Level</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="very">Very Active</option>
              <option value="extreme">Extremely Active</option>
            </select>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 mb-4 overflow-y-auto border border-blue-100">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <i className="fas fa-robot text-blue-500"></i>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "assistant"
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-[#2C3E50] shadow-sm"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content
                      .split("_")
                      .map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center ml-3">
                    <i className="fas fa-user text-white"></i>
                  </div>
                )}
              </div>
            ))}
            {streamingMessage && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-robot text-blue-500"></i>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 text-[#2C3E50] max-w-[80%] shadow-sm">
                  <div className="whitespace-pre-wrap">
                    {streamingMessage
                      .split("_")
                      .map((part, i) =>
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                  </div>
                </div>
              </div>
            )}
            {isLoading && !streamingMessage && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i className="fas fa-robot text-blue-500"></i>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 text-[#2C3E50] shadow-sm">
                  <i className="fas fa-spinner fa-pulse mr-2"></i> Thinking...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message here..."
              className="flex-1 p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;