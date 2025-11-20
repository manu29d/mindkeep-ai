import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { chatWithTodoContext } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { todos, categories } = useTodo();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I can help you prioritize, summarize, or plan your tasks. What do you need?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await chatWithTodoContext(userMsg.text, todos, categories);

    const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setLoading(false);
  };

  return (
    <div className="w-96 h-screen fixed right-0 top-0 bg-white dark:bg-gray-800 border-l dark:border-gray-700 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-indigo-600 text-white">
        <div className="flex items-center space-x-2">
          <Sparkles size={18} />
          <span className="font-bold">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg rounded-bl-none shadow-sm flex items-center space-x-2">
               <Loader2 size={16} className="animate-spin text-indigo-600" />
               <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-colors">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your tasks..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`p-2 rounded-full transition-colors ${input.trim() ? 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-600' : 'text-gray-400 dark:text-gray-500'}`}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;