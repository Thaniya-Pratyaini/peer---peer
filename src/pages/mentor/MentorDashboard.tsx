import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAssignedMentees, getMeetLink } from '@/services/api';
import { Users, Link2, ClipboardList } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<{ id: string; name: string }[]>([]);
  const [meetLink, setMeetLink] = useState('');

  useEffect(() => {
    if (!user) return;
    getAssignedMentees(user.id).then(setMentees);
    getMeetLink(user.id).then(setMeetLink);
  }, [user]);

  const stats = [
    { label: 'Assigned Mentees', value: mentees.length, icon: Users },
    { label: 'Meet Link', value: meetLink ? 'Set' : 'Not set', icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Welcome, {user?.name}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {mentees.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Your Mentees</h3>
          <ul className="space-y-2">
            {mentees.map(m => (
              <li key={m.id} className="flex items-center gap-2 text-sm text-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                {m.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
