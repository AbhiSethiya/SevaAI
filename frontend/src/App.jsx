import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChatbotProvider } from "./contexts/ChatbotContext";
import AuthModal from "./components/AuthModal";
import Layout from "./layouts/Layout";
import HomePage from "./pages/HomePage";
import ComplaintRegistration from "./pages/ComplaintRegistration";
import MyComplaints from "./pages/MyComplaints";
import FAQ from "./pages/FAQ";
import Heatmaps from "./pages/Heatmaps";
import Dashboard from "./pages/Dashboard";
import WorkerDashboard from "./pages/WorkerDashboard";

// Role-based route protection component
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home page and open auth modal
    openAuthModal();
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User doesn't have permission, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

// Auto-redirect component for logged-in users accessing home page
const HomePageWrapper = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in and accesses home page, redirect to their dashboard
  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === "worker") {
      return <Navigate to="/worker" replace />;
    }
  }

  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

// App Routes Component (needs to be inside AuthProvider to use useAuth)
const AppRoutes = () => {
  const { showAuthModal, closeAuthModal } = useAuth();

  return (
    <>
      <Routes>
        {/* Home page with auto-redirect for logged-in users */}
        <Route path="/" element={<HomePageWrapper />} />

        {/* Public routes */}
        <Route
          path="/register-complaint"
          element={
            <Layout>
              <ComplaintRegistration />
            </Layout>
          }
        />
        <Route
          path="/my-complaints"
          element={
            <Layout>
              <MyComplaints />
            </Layout>
          }
        />
        <Route
          path="/faq"
          element={
            <Layout>
              <FAQ />
            </Layout>
          }
        />
        <Route
          path="/heatmaps"
          element={
            <Layout>
              <Heatmaps />
            </Layout>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Worker-only routes */}
        <Route
          path="/worker"
          element={
            <RoleProtectedRoute allowedRoles={["worker"]}>
              <WorkerDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;
