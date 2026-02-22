import { clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from "@/lib/auth-storage";
import { MentorMenteeMapping, Resource, SessionRecord, Todo, User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type ApiRole = "admin" | "mentor" | "mentee";

interface ApiUser {
  id: number;
  name: string;
  role: ApiRole;
}

interface ApiLoginResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

interface ApiMapping {
  mentor_id: number;
  mentor_name: string;
  mentee_id: number;
  mentee_name: string;
}

interface ApiResource {
  id: number;
  title: string;
  url: string;
  uploaded_at: string;
}

interface ApiSession {
  id: number;
  mentor_name: string;
  mentee_name: string;
  date: string;
  fluency_score: number;
  confidence_score: number;
  notes: string;
  next_steps: string;
}

interface ApiTodo {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  mentee_id: number;
}

const roleToApi: Record<string, ApiRole> = {
  Admin: "admin",
  Mentor: "mentor",
  Mentee: "mentee",
};

const roleFromApi: Record<ApiRole, "Admin" | "Mentor" | "Mentee"> = {
  admin: "Admin",
  mentor: "Mentor",
  mentee: "Mentee",
};

function toUser(user: ApiUser): User {
  return {
    id: String(user.id),
    name: user.name,
    role: roleFromApi[user.role],
  };
}

function toMapping(mapping: ApiMapping): MentorMenteeMapping {
  return {
    mentorId: String(mapping.mentor_id),
    mentorName: mapping.mentor_name,
    menteeId: String(mapping.mentee_id),
    menteeName: mapping.mentee_name,
  };
}

function toResource(resource: ApiResource): Resource {
  return {
    id: String(resource.id),
    title: resource.title,
    url: resource.url ? `${API_BASE_URL}${resource.url}` : "#",
    uploadedAt: resource.uploaded_at,
  };
}

function toSession(session: ApiSession): SessionRecord {
  return {
    id: String(session.id),
    mentorName: session.mentor_name,
    menteeName: session.mentee_name,
    date: session.date,
    fluencyScore: session.fluency_score,
    confidenceScore: session.confidence_score,
    notes: session.notes,
    nextSteps: session.next_steps,
  };
}

function toTodo(todo: ApiTodo): Todo {
  return {
    id: String(todo.id),
    title: todo.title,
    description: todo.description,
    dueDate: todo.due_date,
    completed: todo.completed,
    menteeId: String(todo.mentee_id),
  };
}

function handleUnauthorized() {
  clearStoredAuth();
  if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.assign("/");
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers || {});

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleUnauthorized();
    }

    let errorMessage = "Request failed";
    try {
      const body = await response.json();
      errorMessage = body.detail || errorMessage;
    } catch {
      // no-op
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function currentUserOrThrow(): User {
  const user = getStoredUser();
  if (!user) throw new Error("User session not found");
  return user;
}

export async function login(name: string, role: string, password: string): Promise<User> {
  const data = await apiRequest<ApiLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      name,
      role: roleToApi[role],
      password,
    }),
  });
  const user = toUser(data.user);
  setStoredAuth(data.access_token, user);
  return user;
}

export async function createUserByAdmin(
  name: string,
  role: "Mentor" | "Mentee",
  password: string,
): Promise<User> {
  const user = await apiRequest<ApiUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify({
      name,
      role: roleToApi[role],
      password,
    }),
  });
  return toUser(user);
}

export async function mapMentor(mentorId: string, menteeId: string): Promise<MentorMenteeMapping> {
  await apiRequest("/admin/map-mentor", {
    method: "POST",
    body: JSON.stringify({
      mentor_id: Number(mentorId),
      mentee_id: Number(menteeId),
    }),
  });

  const mappings = await getMappings();
  const mapped = mappings.find((m) => m.menteeId === menteeId);
  if (!mapped) throw new Error("Mapping could not be loaded");
  return mapped;
}

export async function uploadPdf(file: File, title: string): Promise<Resource> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const resource = await apiRequest<ApiResource>("/admin/resources", {
    method: "POST",
    body: formData,
  });
  return toResource(resource);
}

export async function setMeetLink(mentorId: string, meetLink: string): Promise<{ success: boolean }> {
  await apiRequest(`/mentor/${Number(mentorId)}/meet-link`, {
    method: "PUT",
    body: JSON.stringify({ meet_link: meetLink }),
  });
  return { success: true };
}

export async function logSession(
  payload: Omit<SessionRecord, "id" | "mentorName" | "menteeName"> & { menteeId: string },
): Promise<SessionRecord> {
  const session = await apiRequest<ApiSession>("/mentor/sessions", {
    method: "POST",
    body: JSON.stringify({
      mentee_id: Number(payload.menteeId),
      date: payload.date,
      fluency_score: payload.fluencyScore,
      confidence_score: payload.confidenceScore,
      notes: payload.notes,
      next_steps: payload.nextSteps,
    }),
  });
  return toSession(session);
}

export async function assignTodo(payload: Omit<Todo, "id" | "completed">): Promise<Todo> {
  const todo = await apiRequest<ApiTodo>("/mentor/todos", {
    method: "POST",
    body: JSON.stringify({
      mentee_id: Number(payload.menteeId),
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
    }),
  });
  return toTodo(todo);
}

export async function getMentorForMentee(menteeId: string): Promise<{ mentorName: string; meetLink: string } | null> {
  const data = await apiRequest<{ mentor_name: string; meet_link: string } | null>(`/mentee/${Number(menteeId)}/mentor`);
  if (!data) return null;
  return { mentorName: data.mentor_name, meetLink: data.meet_link };
}

export async function getTodos(menteeId: string): Promise<Todo[]> {
  const todos = await apiRequest<ApiTodo[]>(`/mentee/${Number(menteeId)}/todos`);
  return todos.map(toTodo);
}

export async function getResources(): Promise<Resource[]> {
  const user = currentUserOrThrow();
  const path = user.role === "Admin" ? "/admin/resources" : "/mentee/resources";
  const resources = await apiRequest<ApiResource[]>(path);
  return resources.map(toResource);
}

export async function getSessionRecords(): Promise<SessionRecord[]> {
  const sessions = await apiRequest<ApiSession[]>("/admin/sessions");
  return sessions.map(toSession);
}

export async function getMappings(): Promise<MentorMenteeMapping[]> {
  const mappings = await apiRequest<ApiMapping[]>("/admin/mappings");
  return mappings.map(toMapping);
}

export async function getMentors(): Promise<User[]> {
  const users = await apiRequest<ApiUser[]>("/admin/mentors");
  return users.map(toUser);
}

export async function getMentees(): Promise<User[]> {
  const users = await apiRequest<ApiUser[]>("/admin/mentees");
  return users.map(toUser);
}

export async function getAssignedMentees(mentorId: string): Promise<{ id: string; name: string }[]> {
  const mentees = await apiRequest<ApiUser[]>(`/mentor/${Number(mentorId)}/mentees`);
  return mentees.map((m) => ({ id: String(m.id), name: m.name }));
}

export async function toggleTodo(todoId: string): Promise<Todo> {
  const todo = await apiRequest<ApiTodo>(`/mentee/todos/${Number(todoId)}/toggle`, {
    method: "PATCH",
  });
  return toTodo(todo);
}

export async function getMeetLink(mentorId: string): Promise<string> {
  const link = await apiRequest<{ meet_link: string }>(`/mentor/${Number(mentorId)}/meet-link`);
  return link.meet_link || "";
}
