import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { assignTodo, getAssignedMentees } from '@/services/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function AssignTodo() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<{ id: string; name: string }[]>([]);
  const [menteeId, setMenteeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) getAssignedMentees(user.id).then(setMentees);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menteeId) return;
    setLoading(true);
    setSuccess(false);
    try {
      await assignTodo({ title, description, dueDate, menteeId });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setDueDate('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Assign To-Do Task</h2>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Mentee</label>
          <select value={menteeId} onChange={e => setMenteeId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" required>
            <option value="">Select mentee</option>
            {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Task Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Task title" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Task details..." required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
        </div>
        {success && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Task assigned!</div>}
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Assign Task
        </button>
      </form>
    </div>
  );
}
