import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import collaborationImage from "../assets/Collaboration.png";
import { MessageCircle, Home, Users, FileText, User, Mic, Menu, History, X } from "lucide-react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import {marked} from 'marked';
import DOMPurify from 'dompurify';

const formatResponse = (text) => {
    const cleanedText = text.replace(/\\/g, ''); // Remove ** symbols
    const htmlContent = marked(cleanedText); // Convert to HTML using marked
    return DOMPurify.sanitize(htmlContent); // Sanitize HTML
  };
// Loading animation component
const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center h-48 w-full">
      <motion.div 
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-300 rounded-full opacity-30 animate-ping"></div>
        <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <motion.div 
          className="absolute top-6 left-6 w-8 h-8 bg-purple-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        ></motion.div>
      </motion.div>
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

const API_BASE_URL = '/api'; // Adjust this to your actual API base URL

const apiService = {
  getUserChats: async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'GET',
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },
  
  getChatById: async (chatId) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'GET',
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw error;
    }
  },
  
  createChat: async (title, mode = 'standard') => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        body: JSON.stringify({ title, mode, userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },
  
  sendMessage: async (chatId, content) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  updateChatMode: async (chatId, mode) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'PUT',
        
        body: JSON.stringify({ mode, userId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update chat mode');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating chat mode:', error);
      throw error;
    }
  }
};


function Text() {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeSidebar, setActiveSidebar] = useState('main'); // 'main', 'history', or 'none'
  const [mode, setMode] = useState('standard'); // Possible values: 'standard', 'poetic', 'script', 'sentiment', 'scene'
  const [previousChats, setPreviousChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  
  const chatContainerRef = useRef(null);

//   const fetchUserChats = async () => {
//     setIsFetchingChats(true);
//     try {
//       const chats = await apiService.getUserChats();
//       setPreviousChats(chats.map(chat => ({
//         id: chat._id,
//         title: chat.title,
//         date: new Date(chat.lastActive).toLocaleString(),
//         mode: chat.mode
//       })));
//     } catch (error) {
//       setError('Failed to fetch chats');
//     } finally {
//       setIsFetchingChats(false);
//     }
//   };

  // Auto-scroll to bottom when new messages are added
//   useEffect(() => {
//     fetchUserChats();
//   }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChat = async (chatId) => {
    setIsLoading(true);
    setActiveChatId(chatId);
    
    try {
      const chat = await apiService.getChatById(chatId);
      setMode(chat.mode);
      
      // Format messages for UI
      const formattedMessages = chat.messages.map(msg => ({
        id: msg._id,
        type: msg.messageType === 'ai' ? 'ai' : 'user',
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleString()
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      setError('Failed to load chat');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    setIsLoading(true);
      setMessages([]);
    try {
    //   const newChat = await apiService.createChat('New Chat', mode);
      
    //   // Update chat list
    //   setPreviousChats(prev => [{
    //     id: newChat._id,
    //     title: newChat.title,
    //     date: new Date(newChat.createdAt).toLocaleString(),
    //     mode: newChat.mode
    //   }, ...prev]);
      
      
    } catch (error) {
    //   setError('Failed to create new chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending prompt (mock for now, no API calls)
  const sendPrompt = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate API response
    if(mode == 'poetic'){
        axios.post('http://localhost:4000/api/content/poetic-analysis', {
            content: prompt
        })
        .then(function (response) {
            console.log(response);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.poeticContent,
                timestamp: new Date().toLocaleString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setPrompt('');
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    if(mode == 'script'){
        axios.post('http://localhost:4000/api/script/format', {
            script: prompt
        })
        .then(function (response) {
            console.log(response);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.formattedScript,
                timestamp: new Date().toLocaleString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setPrompt('');
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    if(mode == 'sentiment'){
        axios.post('http://localhost:4000/api/content/sentiment-analysis', {
            content: prompt
        })
        .then(function (response) {
            console.log(response);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.sentiment,
                timestamp: new Date().toLocaleString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setPrompt('');
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    if(mode == 'scene'){
        axios.post('http://localhost:4000/api/content/suggest-edits', {
            content: prompt
        })
        .then(function (response) {
            console.log(response);
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.suggestions,
                timestamp: new Date().toLocaleString()
            };
            setMessages(prev => [...prev, aiMessage]);
            setPrompt('');
            setIsLoading(false);
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    // setTimeout(() => {
    //   const aiMessage = {
    //     id: Date.now() + 1,
    //     type: 'ai',
    //     content: `This is a simulated response in ${mode} mode for the prompt: "${prompt}"`,
    //     timestamp: new Date().toLocaleString()
    //   };
      
    //   setMessages(prev => [...prev, aiMessage]);
    //   setPrompt('');
    //   setIsLoading(false);
    // }, 1500);
  };

  // Handle enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  // Handle sidebar toggling with improved functionality
  const toggleSidebar = (sidebar) => {
    if (sidebar === activeSidebar) {
      setActiveSidebar('none');
    } else {
      setActiveSidebar(sidebar);
    }
  };
  

  const changeMode = async (newMode) => {
    setMode(newMode);
    
    // If there's an active chat, update its mode
    if (activeChatId) {
      try {
        await apiService.updateChatMode(activeChatId, newMode);
        
        // Update mode in previousChats list
        setPreviousChats(prev => prev.map(chat => 
          chat.id === activeChatId ? { ...chat, mode: newMode } : chat
        ));
      } catch (error) {
        console.error('Error updating chat mode:', error);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Background Pattern */}
      <motion.div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        style={{
          backgroundImage: 'url("https://raw.githubusercontent.com/stackblitz/stackblitz-bg-image/main/3d-character.png")'
        }}
      />
      
      {/* Main Sidebar */}
      <AnimatePresence>
        {activeSidebar === 'main' && (
          <motion.div 
            className="bg-blue-600 text-white flex flex-col w-64 overflow-hidden"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 flex items-center justify-between">
              <h1 className="font-bold text-xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" /> 
                <span>AI Chat</span>
              </h1>
              <motion.button 
                onClick={() => toggleSidebar('main')}
                className="p-1 rounded-md hover:bg-blue"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <nav className="px-4 py-2">
                
                <ul className="space-y-3">

                    <Link to={'/home'}>
                    <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === '' ? 'bg-orange' : 'hover:bg-blue'} text-white font-medium transition`}
                      onClick={() => setMode('standard')}
                    >
                      <Home className="h-6 w-6 mr-3" />
                      <span>Home</span>
                    </button>
                  </motion.li>
                    </Link>
                
                    
                  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === 'standard' ? 'bg-orange' : 'hover:bg-blue'} text-white font-medium transition`}
                      onClick={() => setMode('standard')}
                    >
                      <Home className="h-6 w-6 mr-3" />
                      <span>Standard Mode</span>
                    </button>
                  </motion.li>
                  
                  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === 'poetic' ? 'bg-orange' : 'hover:bg-blue'} text-white transition`}
                      onClick={() => setMode('poetic')}
                    >
                      <Users className="h-6 w-6 mr-3" />
                      <span>Poetic Version</span>
                    </button>
                  </motion.li>
                  
                  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === 'script' ? 'bg-orange' : 'hover:bg-blue'} text-white transition`}
                      onClick={() => setMode('script')}
                    >
                      <FileText className="h-6 w-6 mr-3" />
                      <span>Script Formatting</span>
                    </button>
                  </motion.li>
                  
                  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === 'sentiment' ? 'bg-orange' : 'hover:bg-blue'} text-white transition`}
                      onClick={() => setMode('sentiment')}
                    >
                      <User className="h-6 w-6 mr-3" />
                      <span>Sentiment Analysis</span>
                    </button>
                  </motion.li>
                  
                  <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <button 
                      className={`w-full flex items-center px-3 py-2 rounded-md ${mode === 'scene' ? 'bg-orange' : 'hover:bg-blue'} text-white transition`}
                      onClick={() => setMode('scene')}
                    >
                      <Mic className="h-6 w-6 mr-3" />
                      <span>Scene Suggestion</span>
                    </button>
                  </motion.li>
                </ul>
              </nav>
            </div>
            
            {/* <div className="p-4 border-t border-blue-700">
              <motion.button 
                className="w-full py-2 px-3 bg-orange hover:bg-orange-600 rounded-md font-medium transition duration-200"
                onClick={startNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                New Chat
              </motion.button>
            </div> */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <AnimatePresence>
        {activeSidebar === 'history' && (
          <motion.div 
            className="bg-white text-gray-800 w-64 flex flex-col border-r border-gray-200 overflow-hidden shadow-lg"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-lg">Chat History</h2>
              <motion.button
                onClick={() => toggleSidebar('history')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {previousChats.map(chat => (
                  <motion.div
                    key={chat.id}
                    className={`p-3 mb-2 rounded-md cursor-pointer ${activeChatId === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => loadChat(chat.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                    <p className="text-sm text-gray-500">{chat.date}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-gray-200">
              <motion.button
                className="w-full py-2 bg-blue-600 text-white rounded-md font-medium"
                onClick={startNewChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start New Chat
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Sidebar toggle buttons in the header */}
        <div className="bg-white p-2 shadow-sm flex gap-2">
          {activeSidebar !== 'main' && (
            <motion.button
              className="bg-blue-600 text-white shadow-md rounded-md p-2"
              onClick={() => toggleSidebar('main')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          )}
          
          {activeSidebar !== 'history' && (
            <motion.button
              className="bg-gray-200 text-gray-700 shadow-md rounded-md p-2"
              onClick={() => toggleSidebar('history')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <History className="h-5 w-5" />
            </motion.button>
          )}
          
          <div className="ml-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">
              Current mode: <span className="text-blue-600">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </span>
          </div>
        </div>

        {/* Chat container */}
        <motion.div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-32 py-10 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {messages.length === 0 ? (
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
              <div className="text-center">
                <img src={collaborationImage} alt="Collaboration" className="max-w-xs mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Start a conversation</h2>
                <p className="text-gray-500">
                  Current mode: <span className="font-medium text-blue-600">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div 
                key={message.id} 
                className="flex flex-col gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {message.type === 'user' ? (
                  // User message
                  <motion.div 
                    className="flex items-start gap-3 pr-10 md:pr-20"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ scale: 1.1 }}
                    >
                      U
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-3 shadow-sm max-w-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <p className="text-gray-800">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                    </motion.div>
                  </motion.div>
                ) : message.type === 'ai' ? (
                  // AI Response
                  <motion.div 
                    className="flex items-start gap-3 ml-12 pl-5 md:pl-10"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-orange rounded-full flex items-center justify-center text-white font-bold"
                      whileHover={{ scale: 1.1 }}
                    >
                      AI
                    </motion.div>
                    <motion.div 
                      className="bg-white rounded-lg p-4 shadow-sm"
                      style={{ maxWidth: '500px' }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <p dangerouslySetInnerHTML={{ __html: formatResponse(message.content) }}
 className="text-gray-800 whitespace-pre-wrap"></p>
                      <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                    </motion.div>
                  </motion.div>
                ) : (
                  // Error message
                  <motion.div 
                    className="flex items-start gap-3 justify-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div 
                      className="bg-red-50 text-red-500 rounded-lg p-3 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                    >
                      <p>{message.content}</p>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingIndicator />
            </motion.div>
          )}
        </motion.div>

        {/* Input area */}
        <motion.div 
          className="bg-white border-t border-gray-200 p-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="max-w-4xl mx-auto flex items-end gap-2">
            <div className="flex-grow relative">
              <motion.textarea
              
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Send a message (${mode} mode)...`}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="1"
                disabled={isLoading}
                initial={{ boxShadow: "0px 0px 0px rgba(0,0,0,0)" }}
                animate={{ boxShadow: "0px 0px 10px rgba(0,0,0,0.1)" }}
                whileFocus={{ boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.3)" }}
                transition={{ duration: 0.3 }}
              />
              {error && (
                <motion.p 
                  className="absolute -top-6 left-0 text-red-500 text-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.p>
              )}
            </div>
            <motion.button
              onClick={sendPrompt}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <motion.div 
                  className="rounded-full h-5 w-5 border-t-2 border-b-2 border-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Text;