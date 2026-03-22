// Local storage-based database with user-specific storage
// Each user has their own isolated data
import { ChatMessage, estimateTokens } from "./contextPruning";
import { generateUUID } from "./utils";

export interface Student {
  id: string;
  name: string;
  firebaseUid?: string;
  createdAt: Date;
}

export interface ChatStats {
  totalQuestions: number;
  subjectsStudied: string[];
  totalTokensUsed: number;
  totalTokensSaved: number;
  sessionHistory: { date: string; questions: number; tokensSaved: number }[];
}

// Get current user ID from localStorage
function getCurrentUserId(): string | null {
  const currentUser = localStorage.getItem("edututor_current_user");
  return currentUser ? JSON.parse(currentUser).id : null;
}

// Generate user-specific storage keys
function getUserStorageKeys(userId: string) {
  return {
    student: `edututor_student_${userId}`,
    messages: `edututor_messages_${userId}`,
    stats: `edututor_stats_${userId}`,
    settings: `edututor_settings_${userId}`,
  };
}

// Get current user's storage keys
function getCurrentUserStorageKeys() {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error("No user logged in");
  }
  return getUserStorageKeys(userId);
}

export function getStudent(): Student | null {
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  const data = localStorage.getItem(getUserStorageKeys(userId).student);
  return data ? JSON.parse(data) : null;
}

export function loginStudent(name: string, firebaseUid?: string): Student {
  // Check if user already exists by name
  const existingUsers = getAllUsers();
  let student: Student;
  
  const existingUser = existingUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
  
  if (existingUser) {
    // Return existing user
    student = existingUser;
    // Update firebaseUid if provided
    if (firebaseUid) {
      student.firebaseUid = firebaseUid;
      const keys = getUserStorageKeys(student.id);
      localStorage.setItem(keys.student, JSON.stringify(student));
    }
  } else {
    // Create new user
    student = {
      id: generateUUID(),
      name,
      firebaseUid,
      createdAt: new Date(),
    };
    const keys = getUserStorageKeys(student.id);
    localStorage.setItem(keys.student, JSON.stringify(student));
  }
  
  // Set as current user
  localStorage.setItem("edututor_current_user", JSON.stringify({ id: student.id, name: student.name }));
  return student;
}

export function logoutStudent(): void {
  localStorage.removeItem("edututor_current_user");
}

export function getAllUsers(): Student[] {
  const users: Student[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("edututor_student_")) {
      const data = localStorage.getItem(key);
      if (data) {
        users.push(JSON.parse(data));
      }
    }
  }
  return users;
}

export function getMessages(): ChatMessage[] {
  try {
    const keys = getCurrentUserStorageKeys();
    const data = localStorage.getItem(keys.messages);
    if (!data) return [];
    return JSON.parse(data).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

export function saveMessage(message: ChatMessage): void {
  try {
    const keys = getCurrentUserStorageKeys();
    const messages = getMessages();
    messages.push(message);
    localStorage.setItem(keys.messages, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save message:", error);
  }
}

export function clearMessages(): void {
  try {
    const keys = getCurrentUserStorageKeys();
    localStorage.removeItem(keys.messages);
  } catch (error) {
    console.error("Failed to clear messages:", error);
  }
}

export function getStats(): ChatStats {
  try {
    const keys = getCurrentUserStorageKeys();
    const data = localStorage.getItem(keys.stats);
    if (!data) {
      return {
        totalQuestions: 0,
        subjectsStudied: [],
        totalTokensUsed: 0,
        totalTokensSaved: 0,
        sessionHistory: [],
      };
    }
    return JSON.parse(data);
  } catch {
    return {
      totalQuestions: 0,
      subjectsStudied: [],
      totalTokensUsed: 0,
      totalTokensSaved: 0,
      sessionHistory: [],
    };
  }
}

export function updateStats(tokensUsed: number, tokensSaved: number, topic: string): void {
  try {
    const keys = getCurrentUserStorageKeys();
    const stats = getStats();
    stats.totalQuestions += 1;
    stats.totalTokensUsed += tokensUsed;
    stats.totalTokensSaved += tokensSaved;
    if (!stats.subjectsStudied.includes(topic)) {
      stats.subjectsStudied.push(topic);
    }

    const today = new Date().toLocaleDateString();
    const todayEntry = stats.sessionHistory.find(s => s.date === today);
    if (todayEntry) {
      todayEntry.questions += 1;
      todayEntry.tokensSaved += tokensSaved;
    } else {
      stats.sessionHistory.push({ date: today, questions: 1, tokensSaved });
    }

    localStorage.setItem(keys.stats, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to update stats:", error);
  }
}

export interface AppSettings {
  darkMode: boolean;
  lowBandwidth: boolean;
}

export function getSettings(): AppSettings {
  try {
    const keys = getCurrentUserStorageKeys();
    const data = localStorage.getItem(keys.settings);
    return data ? JSON.parse(data) : { darkMode: false, lowBandwidth: false };
  } catch {
    return { darkMode: false, lowBandwidth: false };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    const keys = getCurrentUserStorageKeys();
    localStorage.setItem(keys.settings, JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export function clearAllData(): void {
  const userId = getCurrentUserId();
  if (!userId) return;
  
  const keys = getUserStorageKeys(userId);
  Object.values(keys).forEach(key => localStorage.removeItem(key));
  localStorage.removeItem("edututor_current_user");
}

export function deleteUser(userId: string): void {
  const keys = getUserStorageKeys(userId);
  Object.values(keys).forEach(key => localStorage.removeItem(key));
}
