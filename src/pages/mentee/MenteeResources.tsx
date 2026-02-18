import { useEffect, useState } from 'react';
import { getResources } from '@/services/api';
import { Resource } from '@/types';
import { Download, FileText } from 'lucide-react';

export default function MenteeResources() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => { getResources().then(setResources); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">PDF Resources</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {resources.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.uploadedAt}</p>
              </div>
            </div>
            <a href={r.url} className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors">
              <Download className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
