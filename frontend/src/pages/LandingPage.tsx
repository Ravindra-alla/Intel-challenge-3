import { motion } from "framer-motion";
import { BookOpen, Brain, BarChart3, Sparkles, ArrowRight, Globe, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Get personalized explanations for any school subject in simple language.",
    gradient: "stat-gradient-1",
  },
  {
    icon: Zap,
    title: "Smart Context Pruning",
    description: "Reduces token usage by 40-60%, enabling fast responses on slow connections.",
    gradient: "stat-gradient-2",
  },
  {
    icon: BarChart3,
    title: "Learning Dashboard",
    description: "Track your progress, subjects studied, and see token savings analytics.",
    gradient: "stat-gradient-3",
  },
  {
    icon: Globe,
    title: "Low Bandwidth Mode",
    description: "Optimized for remote areas with limited internet connectivity.",
    gradient: "stat-gradient-4",
  },
];

const stats = [
  { value: "40-60%", label: "Token Reduction" },
  { value: "2x", label: "Faster Responses" },
  { value: "50%", label: "Cost Savings" },
  { value: "100+", label: "Topics Covered" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg text-foreground">EduTutor</span>
          </div>
          <Button onClick={() => navigate("/login")} size="sm">
            Start Learning <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 -z-10 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 cursor-default shimmer"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Powered by Context Pruning Technology
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="text-foreground">AI Tutor for</span>{" "}
              <motion.span 
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="hero-gradient-bg bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                Every Student
              </motion.span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Bringing quality education to remote areas of India. Our AI tutor uses smart context pruning to deliver fast, affordable learning — even on slow internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto hover-glow" onClick={() => navigate("/login")}>
                  Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto" onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="glass-card rounded-xl p-4 hover-glow"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How Context Pruning Works */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">How Context Pruning Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Traditional AI sends entire conversation history. Our system sends only what matters.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                ❌ Without Pruning
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="p-2 rounded bg-destructive/10 text-muted-foreground">→ "Hello"</div>
                <div className="p-2 rounded bg-destructive/10 text-muted-foreground">→ "How are you?"</div>
                <div className="p-2 rounded bg-destructive/10 text-muted-foreground">→ "Explain plants"</div>
                <div className="p-2 rounded bg-destructive/10 text-muted-foreground">→ "What is a leaf?"</div>
                <div className="p-2 rounded bg-secondary text-foreground">→ "What is photosynthesis?"</div>
              </div>
              <div className="mt-3 text-sm text-destructive font-medium">~120 tokens sent</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-6 border-2 border-success/30"
            >
              <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                ✅ With Pruning
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="p-2 rounded bg-success/10 text-foreground">Topic: Biology</div>
                <div className="p-2 rounded bg-success/10 text-foreground">Context: Studying plants, leaves</div>
                <div className="p-2 rounded bg-secondary text-foreground">→ "What is photosynthesis?"</div>
              </div>
              <div className="mt-3 text-sm text-success font-medium">~45 tokens sent (62% saved!)</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">Built for Accessibility</h2>
            <p className="text-muted-foreground">Every feature designed for students in remote areas</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  rotate: i % 2 === 0 ? 1 : -1,
                  y: -5
                }}
                className={`${feature.gradient} rounded-2xl p-6 border border-border/50 hover-glow cursor-default transition-all duration-300`}
              >
                <div className="animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center hero-gradient-bg rounded-3xl p-12"
        >
          <Users className="h-12 w-12 text-primary-foreground mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">Join thousands of students across India who are learning smarter with AI.</p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8"
            onClick={() => navigate("/login")}
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">EduTutor</span>
          </div>
          <p className="text-sm text-muted-foreground">Education Tutor for Remote India — Context Pruning Demo</p>
        </div>
      </footer>
    </div>
  );
}
