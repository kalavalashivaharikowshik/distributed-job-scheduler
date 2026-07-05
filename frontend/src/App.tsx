import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProjectsPage } from "./pages/projects/ProjectsPage";
import { QueuesPage } from "./pages/queues/QueuesPage";
import { QueueDetailsPage } from "./pages/queues/details/QueueDetailsPage";
import { JobsPage } from "./pages/jobs/JobsPage";
import { JobDetailsPage } from "./pages/jobs/details/JobDetailsPage";
import { WorkersPage } from "./pages/workers/WorkersPage";
import { MetricsPage } from "./pages/metrics/MetricsPage";
import { DLQPage } from "./pages/dlq/DLQPage";
import { RetryPoliciesPage } from "./pages/retry-policies/RetryPoliciesPage";
import { ExecutionsPage } from "./pages/executions/ExecutionsPage";
import { NotFoundPage } from "./pages/errors/NotFoundPage";
import { Toaster } from "react-hot-toast";


function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            background: "#0f172a",
            color: "#fff",
            fontWeight: 700,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/queues" element={<QueuesPage />} />
              <Route path="/queues/:id" element={<QueueDetailsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/workers" element={<WorkersPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/dlq" element={<DLQPage />} />
              <Route path="/retry-policies" element={<RetryPoliciesPage />} />
              <Route path="/jobs/:id/executions" element={<ExecutionsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;