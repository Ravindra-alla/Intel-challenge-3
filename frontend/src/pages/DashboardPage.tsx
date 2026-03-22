import { motion } from "framer-motion";
import { MessageSquare, BookOpen, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats } from "@/lib/database";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(25, 95%, 53%)", "hsl(173, 58%, 39%)", "hsl(262, 83%, 58%)", "hsl(340, 82%, 52%)"];

export default function DashboardPage() {
  const stats = getStats();

  const statCards = [
    {
      icon: MessageSquare,
      title: "Questions Asked",
      value: stats.totalQuestions,
      gradient: "stat-gradient-1",
    },
    {
      icon: BookOpen,
      title: "Subjects Studied",
      value: stats.subjectsStudied.length,
      gradient: "stat-gradient-2",
    },
    {
      icon: Zap,
      title: "Tokens Saved",
      value: stats.totalTokensSaved.toLocaleString(),
      gradient: "stat-gradient-3",
    },
    {
      icon: TrendingUp,
      title: "Efficiency",
      value: stats.totalTokensUsed > 0
        ? `${Math.round((stats.totalTokensSaved / (stats.totalTokensUsed + stats.totalTokensSaved)) * 100)}%`
        : "—",
      gradient: "stat-gradient-4",
    },
  ];

  const tokenData = [
    { name: "Used", value: stats.totalTokensUsed || 1 },
    { name: "Saved", value: stats.totalTokensSaved || 1 },
  ];

  const sessionData = stats.sessionHistory.length > 0
    ? stats.sessionHistory.slice(-7)
    : [
        { date: "Day 1", questions: 3, tokensSaved: 45 },
        { date: "Day 2", questions: 5, tokensSaved: 82 },
        { date: "Day 3", questions: 2, tokensSaved: 30 },
      ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Learning Dashboard</h1>
        <p className="text-muted-foreground">Track your learning progress and token savings</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`${stat.gradient} border-border/50`}>
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Questions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="questions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Token Usage Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tokenData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tokenData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="flex justify-center gap-6 pb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[0] }} />
              <span className="text-muted-foreground">Tokens Used</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS[1] }} />
              <span className="text-muted-foreground">Tokens Saved</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Subjects */}
      {stats.subjectsStudied.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Subjects Explored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.subjectsStudied.map((subject) => (
                <span key={subject} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {subject}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
