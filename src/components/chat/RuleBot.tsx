import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BOT_NAME = "Jerry";

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

  if (!input) return "Please type something. Try 'help' to see what I can do.";

  // Greetings
  if (/^(hi|hello|hey)\b/.test(input)) {
    return `Hello! I'm ${BOT_NAME}. Ask me about time, date, math like 'sum 12 and 30', weather stubs, jokes, quotes, conversions, and more. Type 'help'.`;
  }

  if (/how are (you|u)/.test(input)) {
    return "Doing great and ready to help!";
  }

  // Time & Date
  if (/\btime\b/.test(input)) {
    return `Current time: ${new Date().toLocaleTimeString()}`;
  }
  if (/\bdate\b/.test(input) || /what( is|'s) the date/.test(input)) {
    return `Today's date: ${new Date().toLocaleDateString()}`;
  }
  if (/\bweekday\b|what day is it/.test(input)) {
    return new Date().toLocaleDateString(undefined, { weekday: 'long' });
  }

  // Weather (stub)
  const weatherMatch = input.match(/weather in ([a-z\s]+)/);
  if (weatherMatch) {
    const city = weatherMatch[1].trim().replace(/\b\w/g, (m) => m.toUpperCase());
    const moods = ["sunny", "cloudy", "breezy", "rainy", "cozy"];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    return `I can't fetch live weather yet, but ${city} feels ${mood} today. Carry an umbrella just in case ☔.`;
  }

  // Math
  const sumMatch = input.match(/(?:sum|add)\s+(\-?\d+(?:\.\d+)?)\s+(?:and|\+|with)\s+(\-?\d+(?:\.\d+)?)/);
  if (sumMatch) {
    const a = parseFloat(sumMatch[1]);
    const b = parseFloat(sumMatch[2]);
    return `${a} + ${b} = ${a + b}`;
  }

  const arithmetic = input.match(/(-?\d+(?:\.\d+)?)\s*([+\-*\/])\s*(-?\d+(?:\.\d+)?)/);
  if (arithmetic) {
    const a = parseFloat(arithmetic[1]);
    const op = arithmetic[2];
    const b = parseFloat(arithmetic[3]);
    const result = op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : b === 0 ? NaN : a / b;
    return `${a} ${op} ${b} = ${Number.isNaN(result) ? "undefined" : result}`;
  }

  // Conversions
  const cToF = input.match(/(-?\d+(?:\.\d+)?)\s?(?:c|celsius)\s*(?:to|in)\s*(?:f|fahrenheit)/);
  if (cToF) {
    const c = parseFloat(cToF[1]);
    const f = (c * 9) / 5 + 32;
    return `${c}°C = ${f.toFixed(2)}°F`;
  }
  const fToC = input.match(/(-?\d+(?:\.\d+)?)\s?(?:f|fahrenheit)\s*(?:to|in)\s*(?:c|celsius)/);
  if (fToC) {
    const f = parseFloat(fToC[1]);
    const c = ((f - 32) * 5) / 9;
    return `${f}°F = ${c.toFixed(2)}°C`;
  }

  // Date math: days until YYYY-MM-DD
  const until = input.match(/days? until (\d{4}-\d{2}-\d{2})/);
  if (until) {
    const target = new Date(until[1]);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff} day(s) until ${target.toDateString()}` : `That date has passed (${target.toDateString()}).`;
  }

  // Weekday for a given date
  const weekdayFor = input.match(/weekday for (\d{4}-\d{2}-\d{2})/);
  if (weekdayFor) {
    const d = new Date(weekdayFor[1]);
    return d.toLocaleDateString(undefined, { weekday: 'long' });
  }

  // Fun
  if (/joke/.test(input)) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs!",
      "I told my computer I needed a break, and it said 'No problem—I'll go to sleep.'",
      "There are 10 kinds of people: those who understand binary and those who don't."
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (/quote/.test(input)) {
    const quotes = [
      '“Simplicity is the soul of efficiency.” — Austin Freeman',
      '“Code is like humor. When you have to explain it, it’s bad.” — Cory House',
      '“Make it work, make it right, make it fast.” — Kent Beck'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Text transforms
  const rev = input.match(/reverse (.+)/);
  if (rev) return rev[1].split("").reverse().join("");
  const up = input.match(/uppercase (.+)/);
  if (up) return up[1].toUpperCase();
  const low = input.match(/lowercase (.+)/);
  if (low) return low[1].toLowerCase();

  // Help
  if (/help|what can you do|commands?/.test(input)) {
    return [
      `Hi, I'm ${BOT_NAME}! Try these:`,
      "• hi — greeting",
      "• time, date, weekday",
      "• weather in Tokyo — playful stub",
      "• sum 41 and 1 | 12 + 3 — quick math",
      "• 30 c to f | 86 f to c — conversions",
      "• days until 2025-01-01 | weekday for 2025-01-01",
      "• joke | quote",
      "• reverse hello | uppercase hi | lowercase BYE",
      "• clear — reset the chat",
    ].join("\n");
  }

  if (/bye|goodbye|see ya/.test(input)) {
    return "Goodbye! Have a great day 👋";
  }

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
        { id: generateId(), role: "bot", ts: Date.now(), text: `Hey! I'm ${BOT_NAME}, a playful rule‑based chatbot. Type 'help' to see examples.` },
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
        <CardTitle className="text-xl">Jerry — Rule‑based Chatbot</CardTitle>
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
