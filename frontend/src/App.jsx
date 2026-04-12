import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Loader2 } from "lucide-react";

const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkshopDetails = lazy(() => import("./pages/WorkshopDetails"));
const ProposeWorkshop = lazy(() => import("./pages/ProposeWorkshop"));
const Profile = lazy(() => import("./pages/Profile"));
const Statistics = lazy(() => import("./pages/Statistics"));
const WorkshopTypes = lazy(() => import("./pages/WorkshopTypes"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Dashboard /></Suspense></ProtectedRoute>}
        />
        <Route
          path="/workshop/:id"
          element={<ProtectedRoute><Suspense fallback={<PageLoader />}><WorkshopDetails /></Suspense></ProtectedRoute>}
        />
        <Route
          path="/propose"
          element={<ProtectedRoute><Suspense fallback={<PageLoader />}><ProposeWorkshop /></Suspense></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Profile /></Suspense></ProtectedRoute>}
        />
        <Route path="/statistics" element={<Suspense fallback={<PageLoader />}><Statistics /></Suspense>} />
        <Route path="/workshop-types" element={<Suspense fallback={<PageLoader />}><WorkshopTypes /></Suspense>} />
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
