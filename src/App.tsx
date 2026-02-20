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
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import { usePlayerProfile } from "./hooks/usePlayerProfile";

const queryClient = new QueryClient();

function AppRoutes() {
  const { profile } = usePlayerProfile();
  const location = useLocation();
  const showNav = location.pathname !== '/' && location.pathname !== '/profile';

  return (
    <>
      {showNav && <Navbar playerName={profile?.name} level={profile?.level} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
