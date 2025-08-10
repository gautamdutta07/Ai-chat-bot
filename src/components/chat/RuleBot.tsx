import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  ts: number;
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getRuleBasedResponse(inputRaw: string): string {
  const input = inputRaw.trim().toLowerCase();

  // Empty
  if (!input) return "Please type something. Try 'help' to see what I can do.";

  // Clear handled outside

  // Greetings
  if (/^(hi|hello|hey)\b/.test(input)) {
    return "Hello! I'm a rule-based bot. Ask me about time, date, math like 'sum 12 and 30', or type 'help'.";
  }

  // How are you
  if (/how are (you|u)/.test(input)) {
    return "Doing great and ready to help!";
  }

  // Time
  if (/\btime\b/.test(input)) {
    return `Current time: ${new Date().toLocaleTimeString()}`;
  }

  // Date
  if (/\bdate\b/.test(input)) {
    return `Today's date: ${new Date().toLocaleDateString()}`;
  }

  // Sum or add
  const sumMatch = input.match(/(?:sum|add)\s+(\-?\d+(?:\.\d+)?)\s+(?:and|\+|with)\s+(\-?\d+(?:\.\d+)?)/);
  if (sumMatch) {
    const a = parseFloat(sumMatch[1]);
    const b = parseFloat(sumMatch[2]);
    return `${a} + ${b} = ${a + b}`;
  }

  // Basic calc e.g., 12 + 3
  const arithmetic = input.match(/(-?\d+(?:\.\d+)?)\s*([+\-*\/])\s*(-?\d+(?:\.\d+)?)/);
  if (arithmetic) {
    const a = parseFloat(arithmetic[1]);
    const op = arithmetic[2];
    const b = parseFloat(arithmetic[3]);
    const result = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : b === 0 ? NaN : a / b;
    return `${a} ${op} ${b} = ${Number.isNaN(result) ? "undefined" : result}`;
  }

  // Weather (stub)
  const weatherMatch = input.match(/weather in ([a-z\s]+)/);
  if (weatherMatch) {
    const city = weatherMatch[1].trim().replace(/\b\w/g, (m) => m.toUpperCase());
    return `I can't fetch live weather yet, but ${city} usually feels nicer with an umbrella just in case ☔.`;
  }

  if (/help|what can you do|commands?/.test(input)) {
    return [
      "Here are some things you can try:",
      "• 'hi' — greeting",
      "• 'time' or 'date' — show current time/date",
      "• 'sum 41 and 1' or '12 + 3' — quick math",
      "• 'weather in Tokyo' — playful stub",
      "• 'clear' — reset the chat",
    ].join("\n");
  }

  if (/bye|goodbye|see ya/.test(input)) {
    return "Goodbye! Have a great day 👋";
  }

  // Fallback
  return "I didn't catch that. Type 'help' to see supported commands.";
}

const RuleBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const { toast } = useToast();
  const endRef = useRef<HTMLDivElement | null>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Special command: clear
    if (/^clear$/i.test(trimmed)) {
      setMessages([]);
      toast({ title: "Chat cleared", description: "Start a new conversation." });
      return;
    }

    const userMsg: Message = { id: generateId(), role: "user", text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTyping(true);
    await new Promise((r) => setTimeout(r, 450));
    const reply = getRuleBasedResponse(trimmed);
    const botMsg: Message = { id: generateId(), role: "bot", text: reply, ts: Date.now() };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: generateId(), role: "bot", ts: Date.now(), text: "Hey! I'm a tiny rule-based chatbot. Type 'help' to see examples." },
      ]);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const rendered = useMemo(() => (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
          <div
            className={
              m.role === "user"
                ? "max-w-[85%] rounded-lg bg-secondary text-secondary-foreground px-3 py-2 shadow-soft animate-fade-in-up"
                : "max-w-[85%] rounded-lg bg-card text-card-foreground border px-3 py-2 shadow-soft animate-fade-in-up"
            }
          >
            {m.text.split("\n").map((line, i) => (
              <p key={i} className="text-sm leading-relaxed">{line}</p>
            ))}
            <span className="mt-1 block text-[10px] text-muted-foreground">{new Date(m.ts).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
      {typing && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
            <span className="size-1.5 rounded-full bg-foreground/50 animate-pulse" />
            <span className="size-1.5 rounded-full bg-foreground/50 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="size-1.5 rounded-full bg-foreground/50 animate-pulse" style={{ animationDelay: "300ms" }} />
          </span>
          Typing...
        </div>
      )}
      <div ref={endRef} />
    </div>
  ), [messages, typing]);

  return (
    <Card className="shadow-soft border backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <CardHeader>
        <CardTitle className="text-xl">Rule-based Chatbot</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[320px] overflow-y-auto pr-1">{rendered}</div>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <Input
            aria-label="Type your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say hi, ask for time, try 'sum 12 and 30' or type 'clear'"
          />
          <Button type="submit" variant="hero" className="px-5">Send</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RuleBot;
