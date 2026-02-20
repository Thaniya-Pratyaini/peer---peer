import { useEffect, useState } from 'react';
import { createUserByAdmin, getResources, getSessionRecords, getMappings } from '@/services/api';
import { Resource, SessionRecord, MentorMenteeMapping, Role } from '@/types';
import { FileText, Users, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [mappings, setMappings] = useState<MentorMenteeMapping[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Mentor');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    getResources().then(setResources);
    getSessionRecords().then(setSessions);
    getMappings().then(setMappings);
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserRole !== 'Mentor' && newUserRole !== 'Mentee') return;
    setCreateLoading(true);
    setCreateMessage('');
    setCreateError('');
    try {
      const user = await createUserByAdmin(newUserName, newUserRole, newUserPassword);
      setCreateMessage(`${user.role} "${user.name}" created successfully`);
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRole('Mentor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setCreateError(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const stats = [
    { label: 'Resources', value: resources.length, icon: FileText },
    { label: 'Mappings', value: mappings.length, icon: Users },
    { label: 'Sessions', value: sessions.length, icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateUser} className="max-w-xl rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Create Mentor or Mentee Login</h3>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
          <input
            type="text"
            value={newUserName}
            onChange={e => setNewUserName(e.target.value)}
            placeholder="Enter full name"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
          <select
            value={newUserRole}
            onChange={e => setNewUserRole(e.target.value as Role)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          >
            <option value="Mentor">Mentor</option>
            <option value="Mentee">Mentee</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
          <input
            type="password"
            value={newUserPassword}
            onChange={e => setNewUserPassword(e.target.value)}
            placeholder="Set password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>
        {createMessage && <p className="text-sm text-green-600">{createMessage}</p>}
        {createError && <p className="text-sm text-destructive">{createError}</p>}
        <button
          type="submit"
          disabled={createLoading || !newUserName.trim() || !newUserPassword.trim()}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {createLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold text-foreground">Recent Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Mentor</th><th className="pb-2 pr-4">Mentee</th><th className="pb-2">Fluency</th>
            </tr></thead>
            <tbody>
              {sessions.slice(0, 5).map(s => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{s.date}</td>
                  <td className="py-2 pr-4 text-foreground">{s.mentorName}</td>
                  <td className="py-2 pr-4 text-foreground">{s.menteeName}</td>
                  <td className="py-2 text-foreground">{s.fluencyScore}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
