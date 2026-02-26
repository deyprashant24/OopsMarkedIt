import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useBookmarks } from "./context/BookmarkContext"; // 👈 Context hook import kiya

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";

// Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AddMarkModal from "./components/AddMarkModal";
import CommandPalette from "./components/CommandPalette";
import { Loader2 } from "lucide-react";

// 🏗️ The Layout Wrapper (Protected)
function AppLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const { user, loading } = useAuth();
  const { fetchBookmarks } = useBookmarks(); // 👈 Context se fetch method liya

  // 🔄 Refresh Logic: Naya bookmark add hone par context refresh karega
  const handleAddSuccess = () => {
    // window.location.reload() ki ab zaroorat nahi hai 🚀
    fetchBookmarks(); 
  };

  // Splash Screen Logic
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="text-blue-600 animate-spin mb-4" size={40} />
        <p className="text-slate-500 font-medium tracking-tight">
          Loading your digital brain...
        </p>
      </div>
    );
  }

  // Auth Guard
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen font-sans overflow-hidden bg-white relative">
      {/* 1. Sidebar (Fixed Left) */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#ffffff] to-[#eff6ff]">
        <Header
          onOpenModal={() => setIsModalOpen(true)}
          onOpenCommand={() => setIsCommandOpen(true)}
        />
        
        {/* Page Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* 3. Global Modals */}
      <AddMarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSuccess={handleAddSuccess}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user && !loading ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            user && !loading ? <Navigate to="/dashboard" replace /> : <Signup />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes Wrapper */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/collections"
          element={
            <AppLayout>
              <Collections />
            </AppLayout>
          }
        />
        <Route
          path="/collections/:id"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />

        {/* Global Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;