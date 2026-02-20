import { Resource, SessionRecord, Todo, MentorMenteeMapping, User } from '@/types';

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

const mockUsers: User[] = [
  { id: 'admin-1', name: 'Admin', role: 'Admin' },
  { id: 'mentor-1', name: 'Mentor', role: 'Mentor' },
  { id: 'mentor-2', name: 'Mentor', role: 'Mentor' },
  { id: 'mentee-1', name: 'Mentee', role: 'Mentee' },
  { id: 'mentee-2', name: 'Mentee', role: 'Mentee' },
  { id: 'mentee-3', name: 'Mentee', role: 'Mentee' },
];

let mockMappings: MentorMenteeMapping[] = [
  { mentorId: 'mentor-1', mentorName: 'Alice Johnson', menteeId: 'mentee-1', menteeName: 'Charlie Brown' },
  { mentorId: 'mentor-1', mentorName: 'Alice Johnson', menteeId: 'mentee-2', menteeName: 'Diana Ross' },
];

let mockResources: Resource[] = [
  { id: 'res-1', title: 'English Communication Guide', url: '#', uploadedAt: '2026-02-10' },
  { id: 'res-2', title: 'Fluency Practice Exercises', url: '#', uploadedAt: '2026-02-12' },
];

let mockSessions: SessionRecord[] = [
  { id: 'sess-1', mentorName: 'Alice Johnson', menteeName: 'Charlie Brown', date: '2026-02-14', fluencyScore: 7, confidenceScore: 6, notes: 'Good progress on pronunciation', nextSteps: 'Practice tongue twisters' },
  { id: 'sess-2', mentorName: 'Alice Johnson', menteeName: 'Diana Ross', date: '2026-02-15', fluencyScore: 8, confidenceScore: 8, notes: 'Excellent vocabulary usage', nextSteps: 'Prepare a 5-min presentation' },
];

let mockTodos: Todo[] = [
  { id: 'todo-1', title: 'Read Chapter 3', description: 'Complete reading and summarize key points', dueDate: '2026-02-20', completed: false, menteeId: 'mentee-1' },
  { id: 'todo-2', title: 'Record a 2-min speech', description: 'Topic: My favorite hobby', dueDate: '2026-02-22', completed: true, menteeId: 'mentee-1' },
];

let mockMeetLinks: Record<string, string> = {
  'mentor-1': 'https://meet.google.com/abc-defg-hij',
};

const credentialsByUserId: Record<string, string> = {
  'admin-1': 'admin123',
  'mentor-1': 'mentor123',
  'mentor-2': 'mentor123',
  'mentee-1': 'mentee123',
  'mentee-2': 'mentee123',
  'mentee-3': 'mentee123',
};

// --- API Functions ---

export async function login(name: string, role: string, password: string): Promise<User> {
  await delay();
  const normalizedName = name.trim().toLowerCase();
  const existing = mockUsers.find(u => u.role === role && u.name.trim().toLowerCase() === normalizedName);
  if (!existing) throw new Error('User not found');
  const storedPassword = credentialsByUserId[existing.id];
  if (storedPassword !== password) throw new Error('Incorrect password');
  return existing;
}

export async function createUserByAdmin(name: string, role: 'Mentor' | 'Mentee', password: string): Promise<User> {
  await delay();
  const cleanName = name.trim();
  const cleanPassword = password.trim();
  if (!cleanName || !cleanPassword) throw new Error('Name and password are required');

  const duplicate = mockUsers.find(u => u.role === role && u.name.trim().toLowerCase() === cleanName.toLowerCase());
  if (duplicate) throw new Error(`${role} with this name already exists`);

  const user: User = { id: `${role.toLowerCase()}-${Date.now()}`, name: cleanName, role };
  mockUsers.push(user);
  credentialsByUserId[user.id] = cleanPassword;
  return user;
}

export async function mapMentor(mentorId: string, menteeId: string): Promise<MentorMenteeMapping> {
  await delay();
  const mentor = mockUsers.find(u => u.id === mentorId);
  const mentee = mockUsers.find(u => u.id === menteeId);
  const mapping: MentorMenteeMapping = {
    mentorId, menteeId,
    mentorName: mentor?.name || 'Unknown',
    menteeName: mentee?.name || 'Unknown',
  };
  mockMappings.push(mapping);
  return mapping;
}

export async function uploadPdf(file: File, title: string): Promise<Resource> {
  await delay(800);
  const resource: Resource = { id: `res-${Date.now()}`, title, url: '#', uploadedAt: new Date().toISOString().split('T')[0] };
  mockResources.push(resource);
  return resource;
}

export async function setMeetLink(mentorId: string, meetLink: string): Promise<{ success: boolean }> {
  await delay();
  mockMeetLinks[mentorId] = meetLink;
  return { success: true };
}

export async function logSession(payload: Omit<SessionRecord, 'id'>): Promise<SessionRecord> {
  await delay();
  const session: SessionRecord = { ...payload, id: `sess-${Date.now()}` };
  mockSessions.push(session);
  return session;
}

export async function assignTodo(payload: Omit<Todo, 'id' | 'completed'>): Promise<Todo> {
  await delay();
  const todo: Todo = { ...payload, id: `todo-${Date.now()}`, completed: false };
  mockTodos.push(todo);
  return todo;
}

export async function getMentorForMentee(menteeId: string): Promise<{ mentorName: string; meetLink: string } | null> {
  await delay();
  const mapping = mockMappings.find(m => m.menteeId === menteeId);
  if (!mapping) return null;
  return { mentorName: mapping.mentorName, meetLink: mockMeetLinks[mapping.mentorId] || '' };
}

export async function getTodos(menteeId: string): Promise<Todo[]> {
  await delay();
  return mockTodos.filter(t => t.menteeId === menteeId);
}

export async function getResources(): Promise<Resource[]> {
  await delay();
  return [...mockResources];
}

export async function getSessionRecords(): Promise<SessionRecord[]> {
  await delay();
  return [...mockSessions];
}

export async function getMappings(): Promise<MentorMenteeMapping[]> {
  await delay();
  return [...mockMappings];
}

export async function getMentors(): Promise<User[]> {
  await delay();
  return mockUsers.filter(u => u.role === 'Mentor');
}

export async function getMentees(): Promise<User[]> {
  await delay();
  return mockUsers.filter(u => u.role === 'Mentee');
}

export async function getAssignedMentees(mentorId: string): Promise<{ id: string; name: string }[]> {
  await delay();
  return mockMappings.filter(m => m.mentorId === mentorId).map(m => ({ id: m.menteeId, name: m.menteeName }));
}

export async function toggleTodo(todoId: string): Promise<Todo> {
  await delay();
  const todo = mockTodos.find(t => t.id === todoId);
  if (todo) todo.completed = !todo.completed;
  return todo!;
}

export async function getMeetLink(mentorId: string): Promise<string> {
  await delay();
  return mockMeetLinks[mentorId] || '';
}
