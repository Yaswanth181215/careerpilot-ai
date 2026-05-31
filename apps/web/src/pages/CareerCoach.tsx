import React, { useState } from 'react';
import { ApiClient } from '../services/api.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Compass, Send, User, Sparkles, CheckSquare, BookOpen } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'coach';
  text: string;
}

export const CareerCoach: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await ApiClient.request('/career/coach/ask', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: userMsg,
          history: messages,
        }),
      });

      setMessages((prev) => [...prev, { role: 'coach', text: data.reply }]);
      if (data.actionItems && data.actionItems.length > 0) {
        setActionItems(data.actionItems);
      }
      if (data.resources && data.resources.length > 0) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: 'Sorry, I am facing trouble processing your query right now. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-140px)]">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Career Coach</h1>
        <p className="text-slate-400 text-sm">Ask about company prep strategy, salary negotiation, or technical stacks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 overflow-hidden">
        {/* Chat Interface Column */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
          <Card hoverable={false} className="flex-1 flex flex-col p-4 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 mb-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                  <Compass className="h-10 w-10 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <p className="text-sm font-medium">Start talking with your AI career advisor.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                      msg.role === 'user'
                        ? 'bg-indigo-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                      msg.role === 'user'
                        ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none'
                        : 'bg-slate-900/60 border-white/5 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 self-start max-w-[80%]">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white text-xs animate-pulse">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl rounded-tl-none text-sm text-slate-400 animate-pulse">
                    Analyzing metrics and formulating suggestions...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder="Ask your career advisor anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 py-3"
              />
              <Button type="submit" disabled={loading || !input.trim()} className="px-5">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        {/* Coach Recommendations Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400">
              <CheckSquare className="h-4 w-4" />
              <span>Action Items</span>
            </h3>
            {actionItems.length === 0 ? (
              <p className="text-xs text-slate-500">Suggested tasks will appear here as your conversation progresses.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card hoverable={false} className="flex flex-col gap-4">
            <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-400">
              <BookOpen className="h-4 w-4" />
              <span>Curated Resources</span>
            </h3>
            {resources.length === 0 ? (
              <p className="text-xs text-slate-500">Learning materials and documentation recommendations will appear here.</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {resources.map((res, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default CareerCoach;
