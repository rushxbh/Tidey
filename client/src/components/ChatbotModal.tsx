import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Minimize2 } from 'lucide-react';

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
      content: 'Hello! I\'m your Tidey assistant. I can help you with information about beach cleanups, events, rewards, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getContextualResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Event-related queries
    if (message.includes('event') || message.includes('cleanup') || message.includes('volunteer')) {
      return "I can help you find beach cleanup events! You can browse upcoming events in the Events section, register for events that interest you, and track your participation. Would you like to know about specific events in your area?";
    }
    
    // Rewards and coins
    if (message.includes('aquacoin') || message.includes('reward') || message.includes('coin')) {
      return "AquaCoins are our platform's reward system! You earn coins by participating in events, completing achievements, and uploading event photos. You can spend them in our Rewards Store for merchandise, experiences, and donations. Check your current balance in your profile!";
    }
    
    // Achievements
    if (message.includes('achievement') || message.includes('badge') || message.includes('trophy')) {
      return "Achievements are special milestones you can unlock! From 'First Cleanup' to 'Ocean Guardian', each achievement rewards you with AquaCoins. Visit the Achievements page to see your progress and what you can unlock next.";
    }
    
    // Beach health
    if (message.includes('beach health') || message.includes('scanner') || message.includes('score')) {
      return "Our Beach Health Scanner uses AI to analyze beach conditions! NGOs can upload photos to get health scores based on waste levels, water quality, and biodiversity. This helps track the impact of cleanup efforts over time.";
    }
    
    // How to get started
    if (message.includes('start') || message.includes('begin') || message.includes('new')) {
      return "Welcome to Tidey! To get started: 1) Browse events in the Events section, 2) Register for a cleanup near you, 3) Attend the event and scan the QR code to check in, 4) Complete the cleanup and earn AquaCoins, 5) Upload photos and unlock achievements!";
    }
    
    // NGO specific
    if (message.includes('ngo') || message.includes('organization') || message.includes('create event')) {
      return "As an NGO, you can create and manage beach cleanup events, track volunteer participation, analyze impact data, and use our Beach Health Scanner to monitor environmental improvements. Visit your Dashboard to get started!";
    }
    
    // Donations
    if (message.includes('donation') || message.includes('donate') || message.includes('contribute')) {
      return "You can support beach conservation through our Donations page! Choose from various causes like cleanup supplies, beach restoration, or education programs. All donations are secure and tax-deductible.";
    }
    
    // Default responses
    const defaultResponses = [
      "That's a great question! I'm here to help you navigate Tidey's features. You can ask me about events, rewards, achievements, or how to get more involved in beach conservation.",
      "I'd be happy to help! Tidey connects volunteers with beach cleanup events and rewards environmental action. What specific aspect would you like to know more about?",
      "Thanks for reaching out! Whether you're looking to join events, earn rewards, or learn about our impact tracking, I'm here to guide you through the platform.",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      // Simulate processing time
      setTimeout(() => {
        const response = getContextualResponse(userMessage);
        addMessage('assistant', response);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again or contact support if the issue persists.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-16">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900">Tidey Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14l9-9 9 9M5 10l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-ocean-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-full">
            <Bot className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Tidey Assistant</h3>
            <p className="text-xs text-gray-600">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 text-primary-600 flex-shrink-0" />
                )}
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-1 text-white flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
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
            placeholder="Ask me anything about Tidey..."
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
  );
};

export default ChatbotModal;