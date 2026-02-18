import { useEffect, useState } from 'react';
import { getSessionRecords } from '@/services/api';
import { SessionRecord } from '@/types';

export default function SessionRecords() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => { getSessionRecords().then(setSessions); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Session Records</h2>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="p-3">Date</th><th className="p-3">Mentor</th><th className="p-3">Mentee</th>
            <th className="p-3">Fluency</th><th className="p-3">Confidence</th><th className="p-3">Notes</th><th className="p-3">Next Steps</th>
          </tr></thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground whitespace-nowrap">{s.date}</td>
                <td className="p-3 text-foreground">{s.mentorName}</td>
                <td className="p-3 text-foreground">{s.menteeName}</td>
                <td className="p-3 text-foreground">{s.fluencyScore}/10</td>
                <td className="p-3 text-foreground">{s.confidenceScore}/10</td>
                <td className="p-3 text-foreground">{s.notes}</td>
                <td className="p-3 text-foreground">{s.nextSteps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
