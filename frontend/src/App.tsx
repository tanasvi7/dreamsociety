
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { MobileProvider } from './contexts/MobileContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from "./pages/NotFound";
import WelcomeScreen from './components/welcome/WelcomeScreen';
import LoginScreen from './components/auth/LoginScreen';
import RegisterScreen from './components/auth/RegisterScreen';
import OTPVerification from './components/auth/OTPVerification';
import Dashboard from './components/member/dashboard/Dashboard';
import ProfileManagement from './components/member/profile/ProfileManagement';
import JobPortal from './components/member/jobs/JobPortal';
import JobDetails from './components/member/jobs/JobDetails';
import PostJob from './components/member/jobs/PostJob';
import EditJob from './components/member/jobs/EditJob';
import Notifications from './components/member/Notifications';
// import AdminPanel from './components/admin/AdminPanel';
import PaymentFlow from './components/member/payment/PaymentFlow';
import MembershipPlans from './components/member/payment/MembershipPlans';
import Network from './components/member/network/Network';
import MemberProfile from './components/member/profile/MemberProfile';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUserManagement from "./components/admin/AdminUserManagement";
import AdminJobManagement from "./components/admin/AdminJobManagement";
import AdminBulkUpload from "./components/admin/AdminBulkUpload";
import AdminSubscriptionManagement from "./components/admin/AdminSubscriptionManagement";

import About from './components/welcome/About';
import Society from './components/welcome/Society';
import Contact from './components/welcome/Contact';
import Policy from './components/welcome/Policy';
import TermsAndConditions from './components/welcome/TermsAndConditions';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <MobileProvider>
          <BrowserRouter>
            <Routes>
              {/* Routes without Navbar */}
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/about" element={<About />} />
              <Route path="/society" element={<Society />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/policy" element={<Policy />} />
              <Route path="/terms" element={<TermsAndConditions />} />

              {/* Member routes with MainLayout (navbar) */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfileManagement />} />
                <Route path="/jobs" element={<JobPortal />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/edit-job/:id" element={<EditJob />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/network" element={<Network />} />
                <Route path="/network/:id" element={<MemberProfile />} />
                <Route path="/profile/:id" element={<MemberProfile />} />
                <Route path="/membership" element={<MembershipPlans />} />
              </Route>

              {/* Admin routes with AdminLayout (sidebar) */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUserManagement />} />
                <Route path="subscriptions" element={<AdminSubscriptionManagement />} />
                <Route path="jobs" element={<AdminJobManagement />} />
                <Route path="bulk-upload" element={<AdminBulkUpload />} />

              </Route>
              
              {/* Other routes that might need their own layout */}
              <Route path="/payment" element={<PaymentFlow />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MobileProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
