import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Check,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

export default function AISidebar({
  isOpen,
  toggleSidebar,
  quill,
  documentId,
  isConnected,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up the quill editor event listener for enter key
  useEffect(() => {
    if (!quill) return;

    const handleTextChange = (delta, oldContents, source) => {
      if (source !== "user") return;

      // Check if the delta contains a newline character
      const ops = delta.ops || [];
      const hasNewLine = ops.some(
        (op) => typeof op.insert === "string" && op.insert.includes("\n")
      );

      if (hasNewLine) {
        // Get the current line content (before the newline)
        const currentLineContent = getCurrentLineContent(quill);
        if (currentLineContent.trim().length > 5) {
          // Only generate suggestions for lines with meaningful content
          generateEnhancedSuggestion(currentLineContent);
        }
      }
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill]);

  // Get current line content
  const getCurrentLineContent = (quill) => {
    const selection = quill.getSelection();
    if (!selection) return "";

    const [line] = quill.getLines(selection.index);
    if (!line) return "";

    return line.text();
  };

  // Generate enhanced content suggestion
  const generateEnhancedSuggestion = async (content) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/content/enhance",
        {
          content,
        }
      );

      const enhancedContent = response.data.enhancedContent;

      // Store the suggestion along with its position
      const selection = quill.getSelection();
      if (selection) {
        const [line] = quill.getLines(selection.index);
        const lineIndex = quill.getIndex(line);
        const lineLength = line.length();

        setSuggestion({
          original: content,
          enhanced: enhancedContent,
          position: {
            index: lineIndex,
            length: lineLength,
          },
        });
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      addMessage({
        sender: "system",
        text: "Failed to generate suggestion. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Accept suggestion
  const acceptSuggestion = () => {
    if (!suggestion || !quill) return;

    const { position, enhanced } = suggestion;
    quill.deleteText(position.index, position.length);
    quill.insertText(position.index, enhanced);

    addMessage({
      sender: "system",
      text: "Suggestion applied!",
      type: "success",
    });

    setSuggestion(null);
  };

  // Reject suggestion
  const rejectSuggestion = () => {
    setSuggestion(null);
  };

  // Add a message to the chat
  const addMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now(),
        timestamp: new Date(),
      },
    ]);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !selectedFeature || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    addMessage({ sender: "user", text: userMessage });

    try {
      setIsLoading(true);
      let endpoint = "";
      let requestData = {};

      // Get the currently selected text from the editor
      let selectedContent = "";
      if (quill.getSelection()) {
        selectedContent = quill.getText(
          quill.getSelection().index,
          quill.getSelection().length
        );
      }

      // If no text is selected, use the entire document
      if (!selectedContent) {
        selectedContent = quill.getText();
      }

      // Determine which endpoint to call based on the selected feature
      switch (selectedFeature) {
        case "enhance":
          endpoint = "/api/content/enhance";
          requestData = { content: userMessage || selectedContent };
          break;
        case "sentiment":
          endpoint = "/api/content/sentiment-analysis";
          requestData = { content: selectedContent };
          break;
        case "poetic":
          endpoint = "/api/content/poetic-analysis";
          requestData = { content: selectedContent };
          break;
        case "script":
          endpoint = "/api/script/format";
          requestData = { script: selectedContent };
          break;
        case "scene":
          endpoint = "/api/film/scene-suggestions";
          requestData = { scene: selectedContent };
          break;
        default:
          throw new Error("Invalid feature selected");
      }

      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        requestData
      );

      // Determine which property to use based on the endpoint
      let responseText = "";
      if (response.data.enhancedContent) {
        responseText = response.data.enhancedContent;
      } else if (response.data.sentiment) {
        responseText = response.data.sentiment;
      } else if (response.data.poeticContent) {
        responseText = response.data.poeticContent;
      } else if (response.data.formattedScript) {
        responseText = response.data.formattedScript;
      } else if (response.data.sceneDetails) {
        responseText = response.data.sceneDetails;
      } else {
        responseText = "Response received but no content found.";
      }

      addMessage({
        sender: "ai",
        text: responseText,
        feature: selectedFeature,
      });
    } catch (error) {
      console.error("Error processing request:", error);
      addMessage({
        sender: "system",
        text: "An error occurred while processing your request.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply AI suggestion to the editor
  const applyToEditor = (text) => {
    if (!quill) return;

    // If text is selected, replace it
    if (quill.getSelection() && quill.getSelection().length > 0) {
      quill.deleteText(quill.getSelection().index, quill.getSelection().length);
      quill.insertText(quill.getSelection().index, text);
    } else {
      // Otherwise, insert at cursor position
      const position = quill.getSelection()
        ? quill.getSelection().index
        : quill.getLength();
      quill.insertText(position, text);
    }

    addMessage({
      sender: "system",
      text: "Content applied to editor!",
      type: "success",
    });
  };

  return (
    <div
      className={`bg-gray-50 border-l border-gray-200 transition-all duration-300 ${
        isOpen ? "w-80" : "w-0"
      } flex flex-col relative h-full`}
    >
      {isOpen && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">AI Writing Assistant</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedFeature("enhance")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedFeature === "enhance"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Enhance
              </button>
              <button
                onClick={() => setSelectedFeature("sentiment")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedFeature === "sentiment"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Sentiment
              </button>
              <button
                onClick={() => setSelectedFeature("poetic")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedFeature === "poetic"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Poetic
              </button>
              <button
                onClick={() => setSelectedFeature("script")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedFeature === "script"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Script Format
              </button>
              <button
                onClick={() => setSelectedFeature("scene")}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  selectedFeature === "scene"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Scene Ideas
              </button>
            </div>
          </div>

          {/* Suggestion UI */}
          {suggestion && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Suggested Enhancement:
              </h4>
              <p className="text-sm text-blue-900 mb-3">
                {suggestion.enhanced}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={rejectSuggestion}
                  className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={acceptSuggestion}
                  className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="mx-auto mb-2" size={24} />
                <p>Select a feature and send a message to get started.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    message.sender === "user"
                      ? "bg-indigo-100 ml-auto"
                      : message.sender === "system"
                      ? `bg-${
                          message.type === "error" ? "red" : "green"
                        }-100 mx-auto text-center`
                      : "bg-white border border-gray-200 mr-auto"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.sender === "ai" && (
                    <button
                      onClick={() => applyToEditor(message.text)}
                      className="mt-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 transition"
                    >
                      Apply to Editor
                    </button>
                  )}
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="text-center py-2">
                <div className="inline-block animate-pulse bg-indigo-100 rounded-full px-3 py-1">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  selectedFeature
                    ? "Enter your prompt..."
                    : "Select a feature first"
                }
                disabled={!selectedFeature || isLoading || !isConnected}
                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={
                  !input.trim() || !selectedFeature || isLoading || !isConnected
                }
                className={`p-2 rounded ${
                  !input.trim() || !selectedFeature || isLoading || !isConnected
                    ? "bg-gray-200 text-gray-500"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } transition`}
              >
                <Send size={18} />
              </button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-1">
                Connect to server to use AI features
              </p>
            )}
          </div>
        </div>
      )}
      <button
        className="absolute -left-10 top-4 bg-gray-200 p-2 rounded-l hover:bg-gray-300 transition"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close AI sidebar" : "Open AI sidebar"}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </div>
  );
}
