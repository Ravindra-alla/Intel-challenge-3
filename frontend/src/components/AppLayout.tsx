import { BookOpen, LayoutDashboard, MessageSquare, Settings, LogOut, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate, Outlet } from "react-router-dom";
import { getStudent, logoutStudent } from "@/lib/database";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Tutor", url: "/chat", icon: MessageSquare },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const student = getStudent();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!student) navigate("/login");
  }, [student, navigate]);

  const handleLogout = () => {
    logoutStudent();
    navigate("/");
  };

  if (!student) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200
        md:relative md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-foreground">EduTutor</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Welcome, {student.name}</p>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
                activeClassName="bg-primary/10 text-primary font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center px-4 bg-card md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-2 font-semibold text-foreground">EduTutor</span>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
