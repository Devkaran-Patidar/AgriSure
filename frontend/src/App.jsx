import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import WorkspaceLayout from "./components/layout/WorkspaceLayout.jsx";

// Authentication
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Public Pages
import Home from "./pages/Home.jsx";
import InfoPage from "./pages/InfoPages.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import RegisterChooser from "./pages/auth/RegisterChooser.jsx";
import FarmerRegister from "./pages/auth/FarmerRegister.jsx";
import CompanyRegister from "./pages/auth/CompanyRegister.jsx";
import VerifyOTP from "./pages/auth/VerifyOTP.jsx";

// Dashboards
import FarmerDashboard from "./pages/farmer/FarmerDashboard.jsx";
import CompanyDashboard from "./pages/company/CompanyDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

// Farmer Pages
import FarmerProfile from "./pages/farmer/FarmerProfile.jsx";
import FarmerCrops from "./pages/farmer/FarmerCrops.jsx";
import FarmerContracts from "./pages/farmer/FarmerContracts.jsx";
import FarmerEarnings from "./pages/farmer/FarmerEarnings.jsx";
import FarmerCropProgress from "./pages/farmer/FarmerCropProgress.jsx";
import FarmerPayments from "./pages/farmer/FarmerPayments.jsx";
import FarmerDocuments from "./pages/farmer/FarmerDocuments.jsx";
import FarmerNotifications from "./pages/farmer/FarmerNotifications.jsx";
import FarmerMessages from "./pages/farmer/FarmerMessages.jsx";

// Company / Buyer Pages
import CompanyProfile from "./pages/company/CompanyProfile.jsx";
import FindFarmers from "./pages/company/FindFarmers.jsx";
import ProcurementRequests from "./pages/company/ProcurementRequests.jsx";
import Negotiations from "./pages/company/Negotiations.jsx";
import CompanyContracts from "./pages/company/CompanyContracts.jsx";
import CompanyCropMonitoring from "./pages/company/CompanyCropMonitoring.jsx";
import CompanyPayments from "./pages/company/CompanyPayments.jsx";
import CompanyReports from "./pages/company/CompanyReports.jsx";
import CompanyNotifications from "./pages/company/CompanyNotifications.jsx";
import CompanyMessages from "./pages/company/CompanyMessages.jsx";

// Contracts
import ContractCreate from "./pages/contracts/ContractCreate.jsx";
import ContractDetail from "./pages/contracts/ContractDetail.jsx";

// Admin
import UserManagement from "./pages/admin/UserManagement";
import AdminContracts from "./pages/admin/AdminContracts.jsx";
import AdminPayments from "./pages/admin/AdminPayments.jsx";
import AdminDisputes from "./pages/admin/AdminDisputes.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { getDashboardPathByRole } from "./lib/routeSecurity.js";

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>

          {/* =====================================================
              PUBLIC ROUTES
          ====================================================== */}

          <Route path="/" element={<Home />} />

          <Route
            path="/about"
            element={<InfoPage type="about" />}
          />

          <Route
            path="/features"
            element={<InfoPage type="features" />}
          />

          <Route
            path="/services"
            element={<InfoPage type="services" />}
          />

          <Route
            path="/how-it-works"
            element={<InfoPage type="how" />}
          />

          <Route
            path="/contact"
            element={<InfoPage type="contact" />}
          />

          {/* <Footer /> */}

          {/* =====================================================
              AUTHENTICATION
          ====================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<RegisterChooser />}
          />

          <Route
            path="/register/farmer"
            element={<FarmerRegister />}
          />

          <Route
            path="/register/company"
            element={<CompanyRegister />}
          />

          <Route
            path="/verify-otp"
            element={<VerifyOTP />}
          />

          <Route
            element={
              <ProtectedRoute
                roles={[
                  "FARMER",
                  "COMPANY",
                  "ADMIN",
                ]}
              />
            }
          >
            <Route
              path="/dashboard"
              element={<RoleDashboardRedirect />}
            />
          </Route>


          {/* =====================================================
              FARMER ROUTES
          ====================================================== */}

          <Route
            element={<ProtectedRoute roles={["FARMER"]} />}
          >
            <Route element={<WorkspaceLayout role="FARMER" />}>
            {/* Dashboard */}
            <Route
              path="/farmer/dashboard"
              element={<FarmerDashboard />}
            />

            {/* Profile */}
            <Route
              path="/farmer/profile"
              element={<FarmerProfile />}
            />

            {/* Crops */}
            <Route
              path="/farmer/crops"
              element={<FarmerCrops />}
            />

            {/* Contracts */}
            <Route
              path="/farmer/contracts"
              element={<FarmerContracts />}
            />

            <Route
              path="/farmer/contracts/new"
              element={<ContractCreate />}
            />

            <Route
              path="/farmer/contracts/:id"
              element={<ContractDetail />}
            />

            {/* Crop Progress */}
            <Route
              path="/farmer/crop-progress"
              element={<FarmerCropProgress />}
            />

            {/* Earnings */}
            <Route
              path="/farmer/earnings"
              element={<FarmerEarnings />}
            />

            {/* Payments */}
            <Route
              path="/farmer/payments"
              element={<FarmerPayments />}
            />

            {/* Documents */}
            <Route
              path="/farmer/documents"
              element={<FarmerDocuments />}
            />

            {/* Messages */}
            <Route
              path="/farmer/messages"
              element={<FarmerMessages />}
            />

            {/* Notifications */}
            <Route
              path="/farmer/notifications"
              element={<FarmerNotifications />}
            />
            </Route>
          </Route>


          {/* =====================================================
              COMPANY / BUYER ROUTES
          ====================================================== */}

          <Route
            element={<ProtectedRoute roles={["COMPANY"]} />}
          >
            <Route element={<WorkspaceLayout role="COMPANY" />}>
            {/* Dashboard */}
            <Route
              path="/company/dashboard"
              element={<CompanyDashboard />}
            />

            {/* Company Profile */}
            <Route
              path="/company/profile"
              element={<CompanyProfile />}
            />

            {/* Find Farmers / Crops */}
            <Route
              path="/company/find-farmers"
              element={<FindFarmers />}
            />

            {/* Procurement Requests */}
            <Route
              path="/company/procurement"
              element={<ProcurementRequests />}
            />

            {/* Negotiations */}
            <Route
              path="/company/negotiations"
              element={<Negotiations />}
            />

            {/* Contracts */}
            <Route
              path="/company/contracts"
              element={<CompanyContracts />}
            />

            <Route
              path="/company/contracts/:id"
              element={<ContractDetail />}
            />

            {/* Crop Monitoring */}
            <Route
              path="/company/crop-monitoring"
              element={<CompanyCropMonitoring />}
            />

            {/* Payments */}
            <Route
              path="/company/payments"
              element={<CompanyPayments />}
            />

            {/* Messages */}
            <Route
              path="/company/messages"
              element={<CompanyMessages />}
            />

            {/* Notifications */}
            <Route
              path="/company/notifications"
              element={<CompanyNotifications />}
            />

            {/* Reports */}
            <Route
              path="/company/reports"
              element={<CompanyReports />}
            />
            </Route>
          </Route>


          {/* =====================================================
              ADMIN ROUTES
          ====================================================== */}

          <Route
            element={<ProtectedRoute roles={["ADMIN"]} />}
          >
            <Route element={<WorkspaceLayout role="ADMIN" />}>
            {/* Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            {/* User Management */}
            <Route
              path="/admin/users"
              element={<UserManagement />}
            />

            {/* Contract Management */}
            <Route
              path="/admin/contracts"
              element={<AdminContracts />}
            />

            {/* Payment Management */}
            <Route
              path="/admin/payments"
              element={<AdminPayments />}
            />

            {/* Disputes */}
            <Route
              path="/admin/disputes"
              element={<AdminDisputes />}
            />

            {/* Analytics */}
            <Route
              path="/admin/analytics"
              element={<AdminAnalytics />}
            />
            </Route>
          </Route>


          {/* =====================================================
              CONTRACT ROUTES
          ====================================================== */}

          <Route
            element={
              <ProtectedRoute
                roles={["FARMER", "COMPANY"]}
              />
            }
          >
            <Route
              path="/contracts/:id"
              element={<ContractDetail />}
            />
          </Route>


          {/* =====================================================
              FALLBACK
          ====================================================== */}

          <Route
            path="*"
            element={<Home />}
          />

        </Routes>
      </main>

      {/* <Footer /> */}
    </>
  );
}

function RoleDashboardRedirect() {
  const { user } = useAuth();

  return (
    <Navigate
      to={getDashboardPathByRole(user?.role)}
      replace
    />
  );
}