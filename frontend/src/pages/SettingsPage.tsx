import { motion } from "framer-motion";
import { Moon, Sun, Wifi, WifiOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getSettings, saveSettings, clearMessages, clearAllData } from "@/lib/database";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState(getSettings);

  const toggleDark = () => {
    const updated = { ...settings, darkMode: !settings.darkMode };
    setSettings(updated);
    saveSettings(updated);
  };

  const toggleBandwidth = () => {
    const updated = { ...settings, lowBandwidth: !settings.lowBandwidth };
    setSettings(updated);
    saveSettings(updated);
    toast.success(updated.lowBandwidth ? "Low bandwidth mode enabled" : "Low bandwidth mode disabled");
  };

  const handleClearChat = () => {
    clearMessages();
    toast.success("Chat history cleared");
  };

  const handleClearAll = () => {
    clearAllData();
    toast.success("All data cleared");
    window.location.href = "/";
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Customize your learning experience</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Theme
            </CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{settings.darkMode ? "Dark Mode" : "Light Mode"}</span>
              <Switch checked={settings.darkMode} onCheckedChange={toggleDark} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              {settings.lowBandwidth ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
              Low Bandwidth Mode
            </CardTitle>
            <CardDescription>Optimize for slow internet connections. Reduces animations and simplifies responses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{settings.lowBandwidth ? "Enabled" : "Disabled"}</span>
              <Switch checked={settings.lowBandwidth} onCheckedChange={toggleBandwidth} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Clear your conversation history or all stored data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleClearChat}>
              Clear Chat History
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleClearAll}>
              Clear All Data & Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
