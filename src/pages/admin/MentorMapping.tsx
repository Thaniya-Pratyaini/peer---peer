import { useEffect, useState } from 'react';
import { getMentors, getMentees, mapMentor, getMappings } from '@/services/api';
import { User, MentorMenteeMapping } from '@/types';
import { Loader2, CheckCircle2, Users } from 'lucide-react';

export default function MentorMapping() {
  const [mentors, setMentors] = useState<User[]>([]);
  const [mentees, setMentees] = useState<User[]>([]);
  const [mappings, setMappings] = useState<MentorMenteeMapping[]>([]);
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getMentors().then(setMentors);
    getMentees().then(setMentees);
    getMappings().then(setMappings);
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorId || !menteeId) return;
    setLoading(true);
    setSuccess(false);
    try {
      const m = await mapMentor(mentorId, menteeId);
      setMappings(prev => [...prev, m]);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Map Mentors to Mentees</h2>

      <form onSubmit={handleAssign} className="max-w-lg rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Select Mentor</label>
          <select value={mentorId} onChange={e => setMentorId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" required>
            <option value="">Choose a mentor</option>
            {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Select Mentee</label>
          <select value={menteeId} onChange={e => setMenteeId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" required>
            <option value="">Choose a mentee</option>
            {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        {success && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" /> Assigned!</div>}
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
          Assign
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 font-semibold text-foreground">Current Mappings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 pr-4">Mentor</th><th className="pb-2">Mentee</th>
            </tr></thead>
            <tbody>
              {mappings.map((m, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 text-foreground">{m.mentorName}</td>
                  <td className="py-2 text-foreground">{m.menteeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
