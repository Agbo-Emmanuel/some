import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Landing from "./landing/Landing";
import ScrollToTop from "./ScrollToTop";
import Home from "./landing/pages/Home";
import About from "./landing/pages/About";
import Contact from "./landing/pages/Contact";
import Signup from "./landing/auth/Signup";
import Login from "./landing/auth/Login";
import Otp from "./landing/auth/Otp";
import ResetPassword from "./landing/auth/ResetPassword";
import ForgotPassword from "./landing/auth/ForgotPassword";
import Onboarding from "./landing/auth/Onboarding";
import DashboardLanding from "./dashboard/DashboardLanding";
import Overview from "./dashboard/userDashboard/Overview";
import Documents from "./dashboard/userDashboard/Documents";
import CreateDocument from "./dashboard/userDashboard/CreateDocument";
import Analytics from "./dashboard/userDashboard/Analytics";
import CompanyProfile from "./dashboard/userDashboard/CompanyProfile";
import BrandKit from "./dashboard/userDashboard/BrandKit";
import SettingsLanding from "./dashboard/userDashboard/settings/SettingsLanding";
import AccountSettings from "./dashboard/userDashboard/settings/AccountSettings";
import SecuritySettings from "./dashboard/userDashboard/settings/SecuritySettings";
import NotificationSettings from "./dashboard/userDashboard/settings/NotificationSettings";
import Help from "./dashboard/userDashboard/Help";
import AdminOverview from "./dashboard/adminDashboard/AdminOverview";
import { ToastContainer } from "react-toastify";
import DocumentSetup from "./dashboard/userDashboard/DocumentSetup";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<DashboardLanding role="user" />}>
          <Route index element={<Overview />} />
          <Route path="overview" element={<Overview />} />
          <Route path="documents" element={<Documents />} />
          <Route path="create-document" element={<CreateDocument />} />
          <Route
            path="create-document/:templateId"
            element={<DocumentSetup />}
          />
          <Route path="analytics" element={<Analytics />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="brand-kit" element={<BrandKit />} />

          {/* Settings — landing holds the tab navlinks, children render in its Outlet */}
          <Route path="settings" element={<SettingsLanding />}>
            <Route index element={<Navigate to="account" replace />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
          </Route>

          <Route path="help" element={<Help />} />
        </Route>

        {/* Admin Dashboard using the exact same structure */}
        <Route path="/admin" element={<DashboardLanding role="admin" />}>
          <Route index element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
        </Route>

        <Route element={<Landing />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
