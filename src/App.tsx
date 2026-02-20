import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import QuizPage from "./pages/QuizPage";
import GamePage from "./pages/GamePage";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { usePlayerProfile } from "./hooks/usePlayerProfile";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem('cbc_theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default: light mode (bright)
      document.documentElement.classList.remove('dark');
    }
  }, []);
  return null;
}

function AppRoutes() {
  const { profile } = usePlayerProfile();
  const location = useLocation();
  const showNav = location.pathname !== '/' && location.pathname !== '/profile';

  return (
    <>
      {showNav && (
        <Navbar
          playerName={profile?.name}
          level={profile?.level}
          avatar={profile?.avatar}
        />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInit />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
