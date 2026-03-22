export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokenCount?: number;
  topic?: string;
}

export interface PruningResult {
  originalMessages: ChatMessage[];
  prunedMessages: ChatMessage[];
  originalTokens: number;
  prunedTokens: number;
  prunedCount: number;
  tokensSaved: number;
  savingsPercent: number;
  detectedTopic: string;
}

const TOPICS = [
  "biology", "chemistry", "physics", "math", "history",
  "geography", "literature", "computer science", "general"
];

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function detectTopic(question: string): string {
  const lower = question.toLowerCase();
  for (const topic of TOPICS) {
    if (lower.includes(topic)) return topic;
  }
  return "general";
}

export function pruneContext(
  messages: ChatMessage[],
  currentQuestion: string,
  maxTokens: number = 2000
): PruningResult {
  const originalTokens = messages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);
  const detectedTopic = detectTopic(currentQuestion);
  
  // Keep system message and recent messages
  const prunedMessages: ChatMessage[] = [];
  let totalTokens = 0;
  
  // Add messages from most recent backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const tokens = message.tokenCount || estimateTokens(message.content);
    
    if (totalTokens + tokens <= maxTokens) {
      prunedMessages.unshift(message);
      totalTokens += tokens;
    } else {
      break;
    }
  }
  
  const prunedTokens = prunedMessages.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);
  const tokensSaved = originalTokens - prunedTokens;
  
  return {
    originalMessages: messages,
    prunedMessages,
    originalTokens,
    prunedTokens,
    prunedCount: messages.length - prunedMessages.length,
    tokensSaved,
    savingsPercent: originalTokens > 0 ? Math.round((tokensSaved / originalTokens) * 100) : 0,
    detectedTopic,
  };
}
