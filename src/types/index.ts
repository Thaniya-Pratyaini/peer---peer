export type Role = 'Admin' | 'Mentor' | 'Mentee';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  uploadedAt: string;
}

export interface SessionRecord {
  id: string;
  mentorName: string;
  menteeName: string;
  date: string;
  fluencyScore: number;
  confidenceScore: number;
  notes: string;
  nextSteps: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  menteeId: string;
}

export interface MentorMenteeMapping {
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
}
