import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Zap, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, estimateTokens, pruneContext, PruningResult } from "@/lib/contextPruning";
import { generateStreamingResponse } from "@/lib/aiService";
import { getMessages, saveMessage, updateStats, getSettings } from "@/lib/database";
import { generateUUID } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(getMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastPruning, setLastPruning] = useState<PruningResult | null>(null);
  const [showPruningInfo, setShowPruningInfo] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const settings = getSettings();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: settings.lowBandwidth ? "auto" : "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const question = input.trim();
    setInput("");

    const userMsg: ChatMessage = {
      id: generateUUID(),
      role: "user",
      content: question,
      timestamp: new Date(),
      tokenCount: estimateTokens(question),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveMessage(userMsg);

    // Run context pruning
    const pruningResult = pruneContext(updatedMessages, question);
    setLastPruning(pruningResult);

    setIsTyping(true);

    const cancel = generateStreamingResponse(
      question,
      pruningResult.detectedTopic,
      (partial) => {
        // Update streaming message
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === "streaming") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: partial, tokenCount: estimateTokens(partial) } : m);
          }
          return [...prev, {
            id: "streaming",
            role: "assistant" as const,
            content: partial,
            topic: pruningResult.detectedTopic,
            timestamp: new Date(),
            tokenCount: estimateTokens(partial),
          }];
        });
      },
      (fullResponse) => {
        const aiMsg: ChatMessage = {
          id: generateUUID(),
          role: "assistant",
          content: fullResponse,
          topic: pruningResult.detectedTopic,
          timestamp: new Date(),
          tokenCount: estimateTokens(fullResponse),
        };

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== "streaming");
          return [...filtered, aiMsg];
        });
        saveMessage(aiMsg);
        updateStats(pruningResult.prunedTokens, pruningResult.tokensSaved, pruningResult.detectedTopic);
        setIsTyping(false);
      }
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Pruning Info Bar */}
      {lastPruning && lastPruning.tokensSaved > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-b bg-success/5 px-4 py-2"
        >
          <button onClick={() => setShowPruningInfo(!showPruningInfo)} className="flex items-center gap-2 text-sm w-full">
            <Zap className="h-4 w-4 text-success" />
            <span className="text-success font-medium">
              Context Pruning saved {lastPruning.tokensSaved} tokens ({lastPruning.savingsPercent}%)
            </span>
            <span className="text-muted-foreground ml-auto">Topic: {lastPruning.detectedTopic}</span>
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showPruningInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 text-xs text-muted-foreground space-y-1 overflow-hidden"
              >
                <p>Original: {lastPruning.originalMessages.length} messages ({lastPruning.originalTokens} tokens)</p>
                <p>Pruned: {lastPruning.prunedMessages.length} messages ({lastPruning.prunedTokens} tokens)</p>
                <p>Irrelevant messages removed: {lastPruning.originalMessages.length - lastPruning.prunedMessages.length}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl hero-gradient-bg flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Ask me anything!</h2>
            <p className="text-muted-foreground max-w-sm">
              I can help with Biology, Math, Physics, Chemistry, and more. Try asking about photosynthesis!
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {["What is photosynthesis?", "Explain algebra", "How does gravity work?"].map((q, idx) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setInput(q); }}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-all hover-glow border border-border/10"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={settings.lowBandwidth ? {} : { opacity: 0, x: msg.role === "user" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-8 h-8 rounded-full hero-gradient-bg flex items-center justify-center flex-shrink-0 mt-1 animate-float shadow-sm"
              >
                <Bot className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            )}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className={`max-w-[80%] md:max-w-[65%] ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} shadow-sm hover-glow transition-all duration-300`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <div className={`flex items-center gap-1 mt-1 text-xs ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                <Clock className="h-3 w-3" />
                {formatTime(msg.timestamp)}
              </div>
            </motion.div>
            {msg.role === "user" && (
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
              >
                <User className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </motion.div>
        ))}

        {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full hero-gradient-bg flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="chat-bubble-ai">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-slow" />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-slow" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-slow" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 max-w-3xl mx-auto items-center">
          <motion.div className="flex-1" whileTap={{ scale: 0.99 }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question..."
              className="h-12 border-primary/20 focus-visible:ring-primary/40 transition-all duration-300"
              disabled={isTyping}
            />
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="h-12 px-6 hover-glow">
              <Send className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
