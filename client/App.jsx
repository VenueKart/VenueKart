import React from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ui/error-boundary";
import TokenExpiredNotice from "./components/TokenExpiredNotice";
import Index from "./pages/Index";
import Venues from "./pages/Venues";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import VenueDetail from "./pages/VenueDetail";
import Favorites from "./pages/Favorites";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddVenue from "./pages/AddVenue";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import WhyVenueKart from "./pages/WhyVenueKart";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Layout = ({ children }) => (
  <>
    <Navigation />
    {children}
    <Footer />
    <TokenExpiredNotice />
  </>
);

const AuthLayout = ({ children }) => (
  <>
    <Navigation />
    {children}
  </>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/venues" element={<Layout><Venues /></Layout>} />
            <Route path="/venue/:id" element={<Layout><VenueDetail /></Layout>} />
            <Route path="/favorites" element={<Layout><Favorites /></Layout>} />
            <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/support" element={<Layout><Support /></Layout>} />
            <Route path="/blog" element={<Layout><Blog /></Layout>} />
            <Route path="/careers" element={<Layout><Careers /></Layout>} />
            <Route path="/why-venuekart" element={<Layout><WhyVenueKart /></Layout>} />
            <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
            <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path="/account-settings" element={<Layout><AccountSettings /></Layout>} />
            <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
            <Route path="/signup" element={<AuthLayout><SignUp /></AuthLayout>} />
            <Route path="/verify-otp" element={<AuthLayout><VerifyOTP /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            {/* Admin Dashboard Route */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add-venue" element={<AddVenue />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")).render(<App />);
