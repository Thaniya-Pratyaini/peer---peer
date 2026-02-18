import { useEffect, useState } from 'react';
import { getResources, getSessionRecords, getMappings } from '@/services/api';
import { Resource, SessionRecord, MentorMenteeMapping } from '@/types';
import { FileText, Users, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [mappings, setMappings] = useState<MentorMenteeMapping[]>([]);

  useEffect(() => {
    getResources().then(setResources);
    getSessionRecords().then(setSessions);
    getMappings().then(setMappings);
  }, []);

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
