import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { logSession, getAssignedMentees } from '@/services/api';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function LogSession() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<{ id: string; name: string }[]>([]);
  const [menteeId, setMenteeId] = useState('');
  const [notes, setNotes] = useState('');
  const [fluency, setFluency] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [nextSteps, setNextSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) getAssignedMentees(user.id).then(setMentees);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !menteeId) return;
    setLoading(true);
    setSuccess(false);
    const mentee = mentees.find(m => m.id === menteeId);
    try {
      await logSession({
        mentorName: user.name,
        menteeName: mentee?.name || '',
        date: new Date().toISOString().split('T')[0],
        fluencyScore: fluency,
        confidenceScore: confidence,
        notes,
        nextSteps,
      });
      setSuccess(true);
      setNotes('');
      setNextSteps('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Log Session Record</h2>
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
          <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Session observations..." required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Fluency ({fluency}/10)</label>
            <input type="range" min={1} max={10} value={fluency} onChange={e => setFluency(+e.target.value)} className="w-full accent-primary" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Confidence ({confidence}/10)</label>
            <input type="range" min={1} max={10} value={confidence} onChange={e => setConfidence(+e.target.value)} className="w-full accent-primary" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Next Steps</label>
          <input type="text" value={nextSteps} onChange={e => setNextSteps(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What should the mentee focus on next?" required />
        </div>
        {success && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Session logged!</div>}
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Record
        </button>
      </form>
    </div>
  );
}
