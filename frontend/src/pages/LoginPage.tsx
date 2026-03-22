import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { loginStudent } from "@/lib/database";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!isValidUsername(username) || password.length < 6) return;
    if (isSignup && (password !== confirmPassword || confirmPassword.length < 6)) return;

    setLoading(true);
    setError("");

    try {
      // Simple local authentication - no Firebase
      const student = loginStudent(username);
      console.log(isSignup ? "Account created:" : "Signed in:", username);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const isValidUsername = (username: string) => username.trim().length >= 2;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl hero-gradient-bg mb-4">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to EduTutor</h1>
          <p className="text-muted-foreground mt-2">
            {isSignup ? "Create a new account" : "Sign in to continue learning"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border">
          <div className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            {/* Username Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 h-12 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''}`}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              className="w-full h-12"
              onClick={handleSubmit}
              disabled={
                !isValidUsername(username) || 
                password.length < 6 || 
                (isSignup && (password !== confirmPassword || confirmPassword.length < 6)) ||
                loading
              }
            >
              {loading ? (isSignup ? "Creating account..." : "Signing in...") : (isSignup ? "Create Account" : "Sign In")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Toggle Login/Signup */}
            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setConfirmPassword("");
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                className="text-primary hover:underline font-medium"
              >
                {isSignup ? "Sign In" : "Create new"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
