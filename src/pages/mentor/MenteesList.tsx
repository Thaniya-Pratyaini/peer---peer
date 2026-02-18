import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAssignedMentees } from '@/services/api';

export default function MenteesList() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (user) getAssignedMentees(user.id).then(setMentees);
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Assigned Mentees</h2>
      {mentees.length === 0 ? (
        <p className="text-sm text-muted-foreground">No mentees assigned yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mentees.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">ID: {m.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
