import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotModalProps {
  onClose: () => void;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Tidewy assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize D-ID avatar here
    // This is where you'll integrate the D-ID avatar
    initializeAvatar();
  }, []);

  const initializeAvatar = () => {
    // D-ID Avatar Integration Steps:
    // 1. Load D-ID SDK
    // 2. Initialize avatar with your API key
    // 3. Connect to avatar container (avatarRef.current)
    // 4. Set up event listeners for avatar responses
    
    console.log('Initialize D-ID avatar here');
    // Example integration:
    /*
    if (window.DID && avatarRef.current) {
      const avatar = new window.DID.Avatar({
        container: avatarRef.current,
        apiKey: 'your-d-id-api-key',
        avatarId: 'your-avatar-id'
      });
      
      avatar.on('message', (response) => {
        addMessage('assistant', response.text);
      });
    }
    */
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Here you would integrate with your chatbot API
      // For now, we'll simulate a response
      setTimeout(() => {
        const responses = [
          "I'd be happy to help you with that! Can you tell me more about what you're looking for?",
          "That's a great question! Let me provide you with some information about beach cleanup events.",
          "I can help you find nearby cleanup events or explain how our reward system works.",
          "Thanks for your interest in ocean conservation! Here's what I can help you with..."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage('assistant', randomResponse);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex">
        {/* Avatar Section */}
        <div className="w-1/3 bg-gradient-to-br from-primary-50 to-ocean-50 rounded-l-2xl p-6 flex flex-col items-center justify-center">
          <div 
            ref={avatarRef}
            className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center mb-4"
          >
            {/* D-ID Avatar will be rendered here */}
            <Bot className="h-24 w-24 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidewy Assistant</h3>
          <p className="text-sm text-gray-600 text-center">
            Your AI-powered guide for beach cleanup and ocean conservation
          </p>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Chat with Assistant</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 mt-1 text-primary-600" />
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 mt-1 text-white" />
                    )}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;