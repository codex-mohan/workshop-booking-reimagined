import { lazy, Suspense, Component } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Loader2, AlertCircle } from "lucide-react";

const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkshopDetails = lazy(() => import("./pages/WorkshopDetails"));
const ProposeWorkshop = lazy(() => import("./pages/ProposeWorkshop"));
const Profile = lazy(() => import("./pages/Profile"));
const Statistics = lazy(() => import("./pages/Statistics"));
const WorkshopTypes = lazy(() => import("./pages/WorkshopTypes"));
const Admin = lazy(() => import("./pages/Admin"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );
}

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1">Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
        <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/register" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><Register /></Suspense></ErrorBoundary>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ErrorBoundary></ProtectedRoute>}
        />
        <Route
          path="/workshop/:id"
          element={<ProtectedRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><WorkshopDetails /></Suspense></ErrorBoundary></ProtectedRoute>}
        />
        <Route
          path="/propose"
          element={<ProtectedRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><ProposeWorkshop /></Suspense></ErrorBoundary></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><Profile /></Suspense></ErrorBoundary></ProtectedRoute>}
        />
        <Route path="/statistics" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><Statistics /></Suspense></ErrorBoundary>} />
        <Route path="/workshop-types" element={<ErrorBoundary><Suspense fallback={<PageLoader />}><WorkshopTypes /></Suspense></ErrorBoundary>} />
        <Route
          path="/admin"
          element={<ProtectedRoute><ErrorBoundary><Suspense fallback={<PageLoader />}><Admin /></Suspense></ErrorBoundary></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
