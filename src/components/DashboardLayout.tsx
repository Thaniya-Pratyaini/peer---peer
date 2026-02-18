import { ReactNode, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, Users, ClipboardList, Link2, ListTodo, FileText,
  LogOut, Menu, X, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Upload Resources', path: '/admin/upload', icon: Upload },
    { label: 'Map Mentors', path: '/admin/mapping', icon: Users },
    { label: 'Resources', path: '/admin/resources', icon: FileText },
    { label: 'Sessions', path: '/admin/sessions', icon: ClipboardList },
  ],
  Mentor: [
    { label: 'Dashboard', path: '/mentor', icon: LayoutDashboard },
    { label: 'Meet Link', path: '/mentor/meet', icon: Link2 },
    { label: 'My Mentees', path: '/mentor/mentees', icon: Users },
    { label: 'Log Session', path: '/mentor/log-session', icon: ClipboardList },
    { label: 'Assign Todo', path: '/mentor/assign-todo', icon: ListTodo },
  ],
  Mentee: [
    { label: 'Dashboard', path: '/mentee', icon: LayoutDashboard },
    { label: 'Join Meet', path: '/mentee/meet', icon: Link2 },
    { label: 'My Todos', path: '/mentee/todos', icon: ListTodo },
    { label: 'Resources', path: '/mentee/resources', icon: FileText },
  ],
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const items = navByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">REC-PEP</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 px-3 text-xs text-muted-foreground">
            {user.name} · {user.role}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{user.role} Dashboard</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
