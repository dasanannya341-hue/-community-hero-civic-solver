/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, ShieldAlert, Bot, User, HelpCircle, MapPin, Loader2, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const CivicAssistant: React.FC = () => {
  const { chatWithAssistant, issues, currentUser } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${currentUser?.name || 'Neighbor'}! I am **Community Hero AI**, your conversational civic assistant. 

How can I serve you today? I can:
- **Track incident statuses** (e.g. "What is the status of the garbage report?")
- **Draft incident reports** from your plain words
- **Suggest dispatch departments** for various city hazards
- **Answer civic regulations** (street cleaning, environmental guides)`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    { label: 'Track active reports', q: 'Can you show me the status of current neighborhood issues?' },
    { label: 'Draft a pothole report', q: 'Help me write a professional report about a deep road crater on Main St.' },
    { label: 'Suggest authority contact', q: 'Which municipal department handles toxic chemical dumping?' },
    { label: 'Street sweeping policy', q: 'What are the general rules regarding parking during neighborhood street cleanups?' }
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsgId = `msg_${Date.now()}_user`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      // Map history to server schema
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const assistantReply = await chatWithAssistant(textToSend, history);

      const replyMessage: ChatMessage = {
        id: `msg_${Date.now()}_reply`,
        role: 'model',
        text: assistantReply
      };

      setMessages(prev => [...prev, replyMessage]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          role: 'model',
          text: 'I had trouble reaching the AI brain. Please try again in a few moments.'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handlePresetClick = (q: string) => {
    handleSendMessage(q);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Active Chats Column */}
      <div className="lg:col-span-8 flex flex-col h-[580px] rounded-2xl border border-natural-border bg-white shadow-sm overflow-hidden">
        {/* Header bar */}
        <div className="border-b border-natural-border bg-gradient-to-r from-natural-sidebar to-natural-sidebar-hover p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-natural-sage text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">Civic AI Intelligence Desk</h3>
              <span className="text-[10px] text-natural-sage font-mono font-bold uppercase tracking-wider block mt-1">Gemini 3.5 Active</span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-white/10 text-natural-cream px-2 py-0.5 rounded-full border border-white/10 font-bold">
            Realtime Dispatch Helper
          </span>
        </div>

        {/* Message board container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-natural-sand/20">
          {messages.map((m) => {
            const isBot = m.role === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-sm text-left ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-natural-sage text-white shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs leading-relaxed whitespace-pre-line ${
                    isBot
                      ? 'bg-white border border-natural-border/60 text-natural-text rounded-tl-none'
                      : 'bg-natural-sidebar text-white rounded-tr-none'
                  }`}
                >
                  {m.text}
                </div>
                {!isBot && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-natural-sidebar-hover text-white shrink-0 mt-0.5 font-bold text-[10px] uppercase">
                    {currentUser?.name.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 text-sm text-left justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-natural-sage text-white shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-white border border-natural-border/60 text-natural-muted rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs">
                Community Hero AI is analyzing neighborhood data and preparing report guidelines...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing input container */}
        <div className="border-t border-natural-border p-3.5 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask Community Hero AI for guidance, tracking stats, or report writing..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSending}
              className="flex-1 rounded-xl border border-natural-border px-4 py-2.5 text-sm text-natural-text focus:border-natural-sage focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="rounded-xl bg-natural-sidebar px-4 py-2.5 text-white font-bold hover:bg-natural-sidebar-hover transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Suggested Questions Side Card */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Helper chips card */}
        <div className="rounded-2xl border border-natural-border bg-white p-5 shadow-sm text-left">
          <h4 className="text-xs font-bold text-natural-muted uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-natural-sage" />
            <span>AI Quick Prompts</span>
          </h4>
          <p className="text-xs text-natural-muted leading-relaxed mb-4">
            Click any chip below to immediately query the platform for pre-formulated municipal topics.
          </p>
          <div className="space-y-2.5">
            {presetQuestions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(chip.q)}
                className="w-full text-left rounded-xl border border-natural-border/60 bg-natural-sand/30 p-3 text-xs font-medium text-natural-text hover:bg-natural-sage-light hover:border-natural-sage/30 transition-all cursor-pointer flex items-center justify-between group"
              >
                <span>{chip.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-natural-muted group-hover:text-natural-sage group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Safe Warning / Emergency Card */}
        <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5 shadow-sm text-left">
          <div className="flex gap-2.5 items-start">
            <ShieldAlert className="h-5 w-5 text-[#C45E3A] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#C45E3A] uppercase tracking-wider mb-1">Emergency Situations</h4>
              <p className="text-xs text-natural-text/80 leading-relaxed">
                If there is an active structural fire, medical crisis, or immediate safety danger in progress, **do not write here**. 
                Dial local emergency authorities (e.g. **911** or **112**) right away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
