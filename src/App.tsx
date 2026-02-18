import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UploadResources from "@/pages/admin/UploadResources";
import MentorMapping from "@/pages/admin/MentorMapping";
import ResourceList from "@/pages/admin/ResourceList";
import SessionRecords from "@/pages/admin/SessionRecords";
import MentorDashboard from "@/pages/mentor/MentorDashboard";
import MeetLinkPage from "@/pages/mentor/MeetLinkPage";
import MenteesList from "@/pages/mentor/MenteesList";
import LogSession from "@/pages/mentor/LogSession";
import AssignTodo from "@/pages/mentor/AssignTodo";
import MenteeDashboard from "@/pages/mentee/MenteeDashboard";
import MeetPage from "@/pages/mentee/MeetPage";
import TodoList from "@/pages/mentee/TodoList";
import MenteeResources from "@/pages/mentee/MenteeResources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/upload" element={<ProtectedRoute role="Admin"><UploadResources /></ProtectedRoute>} />
            <Route path="/admin/mapping" element={<ProtectedRoute role="Admin"><MentorMapping /></ProtectedRoute>} />
            <Route path="/admin/resources" element={<ProtectedRoute role="Admin"><ResourceList /></ProtectedRoute>} />
            <Route path="/admin/sessions" element={<ProtectedRoute role="Admin"><SessionRecords /></ProtectedRoute>} />

            <Route path="/mentor" element={<ProtectedRoute role="Mentor"><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor/meet" element={<ProtectedRoute role="Mentor"><MeetLinkPage /></ProtectedRoute>} />
            <Route path="/mentor/mentees" element={<ProtectedRoute role="Mentor"><MenteesList /></ProtectedRoute>} />
            <Route path="/mentor/log-session" element={<ProtectedRoute role="Mentor"><LogSession /></ProtectedRoute>} />
            <Route path="/mentor/assign-todo" element={<ProtectedRoute role="Mentor"><AssignTodo /></ProtectedRoute>} />

            <Route path="/mentee" element={<ProtectedRoute role="Mentee"><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/mentee/meet" element={<ProtectedRoute role="Mentee"><MeetPage /></ProtectedRoute>} />
            <Route path="/mentee/todos" element={<ProtectedRoute role="Mentee"><TodoList /></ProtectedRoute>} />
            <Route path="/mentee/resources" element={<ProtectedRoute role="Mentee"><MenteeResources /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
