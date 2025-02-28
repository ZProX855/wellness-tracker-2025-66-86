
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatAssistant from "./pages/ChatAssistant";
import FoodCompare from "./pages/FoodCompare";
import BMICalculator from "./pages/BMICalculator";
import MealRecognition from "./pages/MealRecognition";
import WellnessJourney from "./pages/WellnessJourney";
import SleepTracker from "./pages/SleepTracker";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/ProfileSettings";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Google Client ID from the provided credentials
const GOOGLE_CLIENT_ID = "200715478376-gkm3iv6safptugc1enc7nlk184b5dafm.apps.googleusercontent.com";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chat-assistant" element={<ChatAssistant />} />
              <Route path="/food-compare" element={<FoodCompare />} />
              <Route path="/bmi-calculator" element={<BMICalculator />} />
              <Route path="/meal-recognition" element={<MealRecognition />} />
              <Route path="/wellness-journey" element={<WellnessJourney />} />
              <Route path="/sleep-tracker" element={<SleepTracker />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileSettings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
