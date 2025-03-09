import React, { useState, useRef, useEffect } from "react";
import { Mic, MessageSquare, StopCircle, Trash2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import Speech from "../assets/Speech.png";
import { marked } from "marked";
import DOMPurify from "dompurify";
import axios from "axios";

const formatResponse = (text) => {
  const cleanedText = text.replace(/\\/g, ""); // Remove ** symbols
  const htmlContent = marked(cleanedText); // Convert to HTML using marked
  return DOMPurify.sanitize(htmlContent); // Sanitize HTML
};

function WhisperSpeechToText() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Canvas reference for audio visualization
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const generateSuggestion = async (content) => {
    try {
      console.log("Generate suggestion for content:", content);
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:4000/api/content/speech-text",
        {
          content,
        }
      );

      const speechContent = response.data.enhancedContent;
      console.log("Received enhanced content:", speechContent);

      const suggestionObj = {
        speech: speechContent,
      };

      console.log("Setting suggestion state:", suggestionObj);
      setSuggestion(suggestionObj);
    } catch (error) {
      console.error("Error generating suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transcript) {
      setIsTyping(true);
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + transcript[index]);
        index++;
        if (index === transcript.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [transcript]);

  // Set up audio visualization
  const setupAudioVisualization = async () => {
    try {
      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create audio context and analyzer
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      // Start visualization
      visualize();
    } catch (err) {
      console.error("Could not set up audio visualization:", err);
      setError(`Visualization error: ${err.message}`);
    }
  };

  // Visualization function
  const visualize = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current)
      return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(249, 250, 251)"; // bg-gray-50
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(16, 185, 129)"; // text-emerald-500

      canvasCtx.beginPath();

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  // Clean up audio visualization
  const cleanupAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const startListening = async () => {
    setError(null);
    try {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        throw new Error("Speech recognition not supported in this browser.");
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += text;
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + " " + finalTranscript);
          setDisplayedText("");
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError(`Recognition error: ${event.error}`);
        setIsListening(false);
        cleanupAudioVisualization();
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };

      recognitionRef.current.start();
      setIsListening(true);

      // Start audio visualization
      await setupAudioVisualization();
    } catch (err) {
      setError(err.message);
      console.error("Speech recognition setup error:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      cleanupAudioVisualization();
    }
    generateSuggestion(displayedText);
  };

  const clearTranscript = () => {
    setTranscript("");
    setDisplayedText("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-full mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Hero Image */}
          <div className="flex justify-center">
            <img src={Speech} alt="Voice Recognition" className="max-w-full" />
          </div>

          {/* Steps */}
          <div className="space-y-6 pr-8">
            <div className="bg-gradient-to-r from-blue to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <Mic className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Step 1: Start Recording
                  </h3>
                  <p className="text-blue-100">
                    Click the "Start Listening" button and get ready to speak
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Step 2: Speak Clearly
                  </h3>
                  <p className="text-purple-100">
                    Speak your content clearly into the microphone
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-4">
                <StopCircle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Step 3: Review Text
                  </h3>
                  <p className="text-emerald-100">
                    Stop recording and review your transcribed text
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Controls - Left Side */}
          <div className="w-full md:w-1/4 flex flex-col gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-6 py-4 font-bold rounded-lg flex items-center justify-center gap-2 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
              }`}
            >
              {isListening ? (
                <>
                  <StopCircle className="w-6 h-6" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" /> Start Recording
                </>
              )}
            </button>

            <button
              onClick={clearTranscript}
              className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              <Trash2 className="w-6 h-6" /> Clear Text
            </button>
          </div>

          {/* Transcript Area - Right Side */}
          <div className="w-full md:w-3/4">
            {/* Error Message */}
            {error && (
              <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Transcript Area with Audio Wave */}
            <div className="relative p-6 bg-white border border-gray-200 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Transcript
              </h3>

              {/* Audio Visualization - Only show when listening */}
              {isListening && (
                <div className="mb-4 bg-gray-50 rounded-lg p-2 h-32">
                  <canvas
                    ref={canvasRef}
                    width="600"
                    height="120"
                    className="w-full h-full"
                  ></canvas>
                </div>
              )}

              {/* Transcript Text */}
              <div className="min-h-[150px] p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {isTyping ? (
                    <span>
                      {displayedText}
                      <span className="animate-pulse">|</span>
                    </span>
                  ) : (
                    transcript || (
                      <span className="text-gray-400 italic">
                        Your spoken words will WhisperSpeechToTextear here...
                      </span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhisperSpeechToText;
