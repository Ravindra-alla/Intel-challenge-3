// AI Service - Optimized for low bandwidth environments
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokenCount?: number;
  topic?: string;
}

// Track in-flight requests to prevent duplicates
const pendingRequests = new Map<string, Promise<string>>();

// Simple cache for recent answers
const localCache = new Map<string, { answer: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Ask question with retry logic, timeout, and deduplication
 * Optimized for low bandwidth: prevents duplicate API calls
 */
export async function askQuestion(question: string): Promise<string> {
  const normalizedQ = question.toLowerCase().trim();
  
  // Check local cache first
  const cached = localCache.get(normalizedQ);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using local cache');
    return cached.answer;
  }
  
  // If there's already a pending request for this question, return it
  if (pendingRequests.has(normalizedQ)) {
    console.log('Reusing pending request');
    return pendingRequests.get(normalizedQ)!;
  }
  
  // Create new request with timeout
  const requestPromise = fetchWithTimeout(
    "/api/ask",
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip" // Request compressed response
      },
      body: JSON.stringify({ question: question.substring(0, 200) }), // Limit question length
    },
    30000 // 30 second timeout for AI responses
  ).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the answer locally
    localCache.set(normalizedQ, { 
      answer: data.answer, 
      timestamp: Date.now() 
    });
    
    // Clean old cache entries periodically
    if (localCache.size > 50) {
      const now = Date.now();
      for (const [key, value] of localCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          localCache.delete(key);
        }
      }
    }
    
    return data.answer;
  }).catch((error) => {
    console.error('API call failed:', error);
    throw error;
  }).finally(() => {
    // Remove from pending after completion
    pendingRequests.delete(normalizedQ);
  });
  
  // Store pending request
  pendingRequests.set(normalizedQ, requestPromise);
  
  return requestPromise;
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string, 
  options: RequestInit, 
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out - please check your connection');
    }
    throw error;
  }
}

/**
 * Generate streaming response optimized for low bandwidth
 * Uses shorter chunks and faster typing for better perceived performance
 */
export function generateStreamingResponse(
  question: string,
  topic: string,
  onProgress: (partial: string) => void,
  onComplete: (fullResponse: string) => void,
  onError?: (error: string) => void
): () => void {
  const controller = new AbortController();
  let isCancelled = false;
  
  (async () => {
    try {
      const response = await fetchWithTimeout(
        "/api/ask",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip"
          },
          body: JSON.stringify({ question: question.substring(0, 200) }),
          signal: controller.signal,
        },
        30000
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const fullAnswer = data.answer;
      
      // Fast streaming for low bandwidth - shorter chunks
      const chunks = fullAnswer.split(/([.,!?]\s+)/); // Split on sentence boundaries
      let currentText = '';
      
      // Show first chunk immediately
      if (chunks.length > 0) {
        currentText = chunks[0];
        onProgress(currentText);
      }
      
      // Stream remaining chunks faster
      for (let i = 1; i < chunks.length; i++) {
        if (isCancelled || controller.signal.aborted) break;
        currentText += chunks[i];
        onProgress(currentText);
        await new Promise(r => setTimeout(r, 15)); // Faster than before (15ms vs 30ms)
      }
      
      if (!isCancelled) {
        onComplete(fullAnswer);
      }
    } catch (error) {
      if (!isCancelled) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Detailed Streaming Error:', error); // Added detailed logging
        onError?.(errorMessage);
        onComplete(`Sorry, there was a connection issue: ${errorMessage}. Please check if the backend is running.`);
      }
    }
  })();
  
  return () => {
    isCancelled = true;
    controller.abort();
  };
}

/**
 * Clear local cache
 */
export function clearLocalCache(): void {
  localCache.clear();
}
