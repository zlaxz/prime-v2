import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "prime-chat-messages";

const quickActions = [
  "What are my top priorities?",
  "What's overdue?",
  "Summarize my inbox",
  "What did I complete today?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        "https://esnfzdpevddzgckwidgf.supabase.co/functions/v1/prime-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response ?? data.message ?? "Sorry, I couldn't process that.",
      };
      setMessages([...newMessages, assistantMsg]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-700 px-6 py-3">
        <h2 className="text-lg font-semibold text-zinc-100">Chat</h2>
        <p className="text-xs text-zinc-500">Ask about your tasks, priorities, or anything else</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Bot className="h-12 w-12 text-purple-400/50" />
            <p className="text-sm text-zinc-500">Start a conversation or try a quick action</p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200"
                  onClick={() => sendMessage(action)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-purple-600/20 text-zinc-100"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-4 w-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600/20">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
                <div className="rounded-lg bg-zinc-800 px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-zinc-700 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="border-zinc-700 bg-zinc-800"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
