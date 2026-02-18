import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { login } from '@/services/api';
import { Role } from '@/types';
import { GraduationCap, Loader2 } from 'lucide-react';

const roles: Role[] = ['Admin', 'Mentor', 'Mentee'];
const roleRoutes: Record<Role, string> = { Admin: '/admin', Mentor: '/mentor', Mentee: '/mentee' };

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('Mentee');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = await login(name, role);
      setUser(user);
      navigate(roleRoutes[role]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">MentorHub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Peer-to-Peer English Communication Program</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
