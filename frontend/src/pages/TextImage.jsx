import React, { useState, useRef, useEffect } from 'react';
import {motion} from 'framer-motion';
import yoga from '../assets/Collaboration.png';
// Creative loading animation component
const CreativeLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-300 rounded-full opacity-30 animate-ping"></div>
        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute top-6 left-6 w-8 h-8 bg-purple-500 rounded-full animate-pulse"></div>
      </div>
      <div className="mt-4 text-blue-600 font-medium">
        <span className="inline-block animate-bounce">G</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.1s" }}>e</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>n</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.3s" }}>e</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.4s" }}>r</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.5s" }}>a</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.6s" }}>t</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.7s" }}>i</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.8s" }}>n</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "0.9s" }}>g</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "1s" }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "1.1s" }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: "1.2s" }}>.</span>
      </div>
    </div>
  );
};

function TextImage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [speechToTextActive, setSpeechToTextActive] = useState(false);
  const [copySuccess, setCopySuccess] = useState(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Clear copy success message after 3 seconds
  useEffect(() => {
    if (copySuccess !== null) {
      const timer = setTimeout(() => {
        setCopySuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const timestamp = new Date().toLocaleString();
      const id = Date.now();
      
      setHistory(prev => [...prev, { 
        id, 
        prompt, 
        timestamp, 
        imageUrl: null, 
        loading: true 
      }]);

      const response = await fetch(`http://localhost:8080/generate-image?prompt=${encodeURIComponent(prompt)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, imageUrl, loading: false } : item
      ));
      
      setPrompt('');
    } catch (err) {
      setError(err.message || 'An error occurred');
      
      setHistory(prev => prev.map(item => 
        item.loading ? { ...item, loading: false, error: true } : item
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  const toggleSpeechToText = () => {
    setSpeechToTextActive(!speechToTextActive);
  };
  
  const handleCopyImage = async (imageUrl, id) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setCopySuccess(id);
    } catch (err) {
      console.error('Failed to copy image:', err);
      alert('Failed to copy image. Your browser may not support this feature.');
    }
  };
  
  const handleDownloadImage = (imageUrl, prompt) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 -z-10"
        style={{
          backgroundImage: 'url("https://raw.githubusercontent.com/stackblitz/stackblitz-bg-image/main/3d-character.png")'
        }}
      />
      
      {/* Fixed Width Sidebar - No longer collapsible */}
      <div className="w-auto bg-blue text-white flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h1 className="font-bold text-xl">AI Image Chat</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-2">
            <ul className="space-y-3">
              <li>
                <button className="w-full flex items-center px-3 py-2 rounded-md bg-blue text-white font-medium hover:bg-orange transition" onClick={() => (window.location.href = '/home')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </button>
              </li>
              
              <li>
                <button className="w-full flex items-center px-3 py-2 rounded-md text-white hover:bg-orange hover:text-white transition"  onClick={() => (window.location.href = '/collaboration')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Collaboration</span>
                </button>
              </li>
              
              <li>
                <button className="w-full flex items-center px-3 py-2 rounded-md text-white hover:bg-orange hover:text-white transition"  onClick={() => (window.location.href = '/blogs')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Blogs</span>
                </button>
              </li>
              
              <li>
                <button className="w-full flex items-center px-3 py-2 rounded-md text-white hover:bg-orange hover:text-white transition"  onClick={() => (window.location.href = '/profile')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </button>
              </li>
              
              <li>
              <button className="w-full flex items-center px-3 py-2 rounded-md text-white hover:bg-orange hover:text-white transition" onClick={() => (window.location.href = '/speechtotext')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Speech to Text</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="p-4 border-t border-blue">
          <button className="w-full py-2 px-3 bg-orange hover:bg-orange rounded-md font-medium transition" onClick={() => window.location.reload()}>
            New Chat
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-[20rem] py-10 space-y-6"
        >
          {history.length === 0 ? (
            <motion.div 
              className="flex items-center justify-center h-full text-gray-500"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: [0.8, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.5,
                rotate: { repeat: Infinity, repeatType: "mirror", duration: 6 }
              }}
            >
              <img src={yoga} alt="Collaboration" />
            </motion.div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="flex flex-col gap-8">
                {/* User prompt */}
                <div className="flex items-start gap-3 pr-[5rem]">
                  <div className="w-8 h-8 bg-blue rounded-full flex items-center justify-center text-white font-bold">
                    U
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow max-w-md">
                    <p className="text-gray-800">{item.prompt}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3 ml-12 right-0 pl-[10rem]">
                  <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow" style={{ maxWidth: '500px' }}>
                    {item.loading ? (
                      <CreativeLoader />
                    ) : item.error ? (
                      <div className="flex items-center justify-center h-48 w-full text-red-500">
                        <p>Error generating image</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <img 
                          src={item.imageUrl} 
                          alt={item.prompt} 
                          className="max-h-80 w-full object-contain rounded"
                        />
                        {/* Copy and Download buttons */}
                        <div className="flex justify-end mt-3 space-x-2">
                          <button 
                            onClick={() => handleCopyImage(item.imageUrl, item.id)}
                            className={`px-3 py-1 ${copySuccess === item.id ? 'bg-green-500' : 'bg-blue'} text-white rounded hover:opacity-90 transition flex items-center`}
                          >
                            {copySuccess === item.id ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleDownloadImage(item.imageUrl, item.prompt)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:opacity-90 transition flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-grow relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter a prompt to generate an image..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue resize-none"
                rows="1"
                disabled={isLoading}
              />
              {error && <p className="absolute -top-6 left-0 text-red-500 text-sm">{error}</p>}
            </div>
            <button
              onClick={generateImage}
              disabled={isLoading}
              className="bg-blue hover:bg-blue text-white px-4 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextImage;