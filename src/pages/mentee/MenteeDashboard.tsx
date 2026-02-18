import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMentorForMentee, getTodos, getResources } from '@/services/api';
import { Link2, ListTodo, FileText } from 'lucide-react';

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<{ mentorName: string; meetLink: string } | null>(null);
  const [todoCount, setTodoCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getMentorForMentee(user.id).then(setMentor);
    getTodos(user.id).then(t => setTodoCount(t.length));
    getResources().then(r => setResourceCount(r.length));
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Welcome, {user?.name}</h2>

      {mentor && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Your Mentor</p>
          <p className="text-lg font-semibold text-foreground">{mentor.mentorName}</p>
          {mentor.meetLink && (
            <a href={mentor.meetLink} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Link2 className="h-4 w-4" /> Join Google Meet
            </a>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><ListTodo className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{todoCount}</p>
              <p className="text-sm text-muted-foreground">To-Do Tasks</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resourceCount}</p>
              <p className="text-sm text-muted-foreground">Resources</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
