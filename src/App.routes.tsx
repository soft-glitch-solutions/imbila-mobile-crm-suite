
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/auth/AuthGuard";
import Dashboard from "./components/Dashboard";
import LeadManagement from "./components/leads/LeadManagement";
import LeadDetails from "./components/leads/LeadDetails";
import SalesTracking from "./components/sales/SalesTracking";
import SaleDetails from "./components/sales/SaleDetails";
import CustomerList from "./components/customers/CustomerList";
import CustomerDetails from "./components/customers/CustomerDetails";
import QuoteGenerator from "./components/quotes/QuoteGenerator";
import QuoteHistory from "./components/quotes/QuoteHistory";
import ComplianceCenter from "./components/compliance/ComplianceCenter";
import WebsiteTemplateSelector from "./components/website/WebsiteTemplateSelector";
import BusinessProfile from "./components/profile/BusinessProfile";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      
      <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard businessType="" />} />
        <Route path="leads" element={<LeadManagement businessType="" />} />
        <Route path="leads/:id" element={<LeadDetails />} />
        <Route path="sales" element={<SalesTracking businessType="" />} />
        <Route path="sales/:id" element={<SaleDetails />} />
        <Route path="customers" element={<CustomerList businessType="" />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="quotes" element={<QuoteHistory />} />
        <Route path="quotes/new" element={<QuoteGenerator businessType="" />} />
        <Route path="quotes/:id" element={<QuoteGenerator businessType="" />} />
        <Route path="compliance" element={<ComplianceCenter businessType="" />} />
        <Route path="website" element={<WebsiteTemplateSelector />} />
        <Route path="profile" element={<BusinessProfile businessType="" />} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
