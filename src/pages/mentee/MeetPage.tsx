import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMentorForMentee } from '@/services/api';
import { Link2, Video } from 'lucide-react';

export default function MeetPage() {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<{ mentorName: string; meetLink: string } | null>(null);

  useEffect(() => {
    if (user) getMentorForMentee(user.id).then(setMentor);
  }, [user]);

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Join Meeting</h2>
      {mentor ? (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Mentor</p>
              <p className="font-semibold text-foreground">{mentor.mentorName}</p>
            </div>
          </div>
          {mentor.meetLink ? (
            <>
              <p className="text-sm text-muted-foreground break-all">{mentor.meetLink}</p>
              <a href={mentor.meetLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <Link2 className="h-4 w-4" /> Join Meet
              </a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Your mentor hasn't set a Meet link yet.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No mentor assigned yet.</p>
      )}
    </div>
  );
}
