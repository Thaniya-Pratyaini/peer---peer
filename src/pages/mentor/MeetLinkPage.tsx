import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { setMeetLink, getMeetLink } from '@/services/api';
import { Loader2, CheckCircle2, Link2 } from 'lucide-react';

export default function MeetLinkPage() {
  const { user } = useAuth();
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) getMeetLink(user.id).then(setLink);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    try {
      await setMeetLink(user.id, link);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Google Meet Link</h2>
      <form onSubmit={handleSave} className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Your permanent Meet link</label>
          <input type="url" value={link} onChange={e => setLink(e.target.value)}
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" required />
        </div>
        {success && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Saved!</div>}
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          Save Link
        </button>
      </form>
    </div>
  );
}
