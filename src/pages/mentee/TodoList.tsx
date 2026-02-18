import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTodos, toggleTodo } from '@/services/api';
import { Todo } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

export default function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (user) getTodos(user.id).then(setTodos);
  }, [user]);

  const handleToggle = async (id: string) => {
    const updated = await toggleTodo(id);
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">My To-Do List</h2>
      {todos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {todos.map(t => (
            <div key={t.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <button onClick={() => handleToggle(t.id)} className="mt-0.5 shrink-0">
                {t.completed
                  ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                  : <Circle className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {t.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
