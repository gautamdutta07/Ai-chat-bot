import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import RuleBot from "@/components/chat/RuleBot";
import BrandBackground from "@/components/BrandBackground";

const Index = () => {
  // SEO for this page
  useEffect(() => {
    document.title = "Rule‑Based Chatbot | Web Weaver";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", "Try a simple, fast rule-based chatbot with helpful built-in commands.");

    // Canonical
    const href = window.location.origin + window.location.pathname;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-surface">
      <BrandBackground />
      <header className="container flex items-center justify-between py-6">
        <a href="#home" className="font-semibold tracking-tight bg-gradient-primary bg-clip-text text-transparent">Web Weaver</a>
        <nav className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
          <a href="#features" className="story-link">Features</a>
          <a href="#chat" className="story-link">Try Demo</a>
        </nav>
      </header>

      <main id="home" className="container">
        <section className="grid md:grid-cols-2 gap-10 items-center py-10 md:py-16">
          <article>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 animate-enter">
              Rule‑Based Chatbot
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-prose animate-fade-in">
              Build intuition for natural language flows with a fast, privacy‑friendly bot that answers using predefined rules and pattern matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#chat"><Button variant="hero" className="px-6 hover-scale">Start chatting</Button></a>
              <a href="#features"><Button variant="outline" className="hover-scale">How it works</Button></a>
            </div>
          </article>
          <aside className="relative">
            <div className="rounded-xl border bg-card p-6 shadow-soft animate-float">
              <p className="text-sm text-muted-foreground">Signature moment</p>
              <p className="mt-2">Subtle floating card with brand glow.</p>
            </div>
          </aside>
        </section>

        <section id="features" className="py-8 md:py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-lg border p-5 bg-card shadow-soft animate-fade-in">
              <h3 className="font-semibold mb-2">Pattern Matching</h3>
              <p className="text-sm text-muted-foreground">Understands greetings, time/date, quick math and more.</p>
            </div>
            <div className="rounded-lg border p-5 bg-card shadow-soft animate-fade-in" >
              <h3 className="font-semibold mb-2">Fast & Private</h3>
              <p className="text-sm text-muted-foreground">All logic runs in your browser—no data leaves the page.</p>
            </div>
            <div className="rounded-lg border p-5 bg-card shadow-soft animate-fade-in">
              <h3 className="font-semibold mb-2">Extensible</h3>
              <p className="text-sm text-muted-foreground">Add new rules easily for your use‑case.</p>
            </div>
          </div>
        </section>

        <section id="chat" className="py-8 md:py-12">
          <RuleBot />
        </section>
      </main>

      <footer className="container py-10 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Web Weaver. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
