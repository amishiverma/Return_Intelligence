import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { AppProvider } from "@/context/AppContext";
import { AnalysisProvider } from "@/context/AnalysisContext";

import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import ExplorerPage from "./pages/ExplorerPage";
import ChatPage from "./pages/ChatPage";
import SustainabilityPage from "./pages/SustainabilityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      {/* 🔑 AppProvider MUST wrap AnalysisProvider */}
      <AppProvider>
        <AnalysisProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/dashboard"
                  element={
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <AppLayout>
                      <UploadPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/explorer"
                  element={
                    <AppLayout>
                      <ExplorerPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <AppLayout>
                      <ChatPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/sustainability"
                  element={
                    <AppLayout>
                      <SustainabilityPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <div className="text-foreground">
                        Settings coming soon
                      </div>
                    </AppLayout>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AnalysisProvider>
      </AppProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
