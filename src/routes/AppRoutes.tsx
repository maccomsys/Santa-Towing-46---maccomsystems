import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/admin/layout/AdminLayout';
import AdminProtectedRoute from '@/admin/components/AdminProtectedRoute';

// Admin Pages
import AdminLogin from '@/admin/pages/AdminLogin';
import AdminDashboardHome from '@/admin/pages/AdminDashboardHome';
import AdminColors from '@/admin/pages/AdminColors';
import AdminLogo from '@/admin/pages/AdminLogo';
import AdminLinks from '@/admin/pages/AdminLinks';
import AdminPagesText from '@/admin/pages/AdminPagesText';
import AdminImages from '@/admin/pages/AdminImages';
import AdminInventory from '@/admin/pages/AdminInventory';
import AdminInvoices from '@/admin/pages/AdminInvoices';
import AdminReceipts from '@/admin/pages/AdminReceipts';
import AdminCustomers from '@/admin/pages/AdminCustomers';
import AdminImageStudio from '@/admin/pages/AdminImageStudio';
import AdminDocSettings from '@/admin/pages/AdminDocSettings';
import AdminBackupExport from '@/admin/pages/AdminBackupExport';
import AdminProfile from '@/admin/pages/AdminProfile';

// Main Public Pages
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Haulage from '@/pages/Haulage';
import Towing from '@/pages/Towing';
import Rental from '@/pages/Rental';
import RentalDetails from '@/pages/RentalDetails';
import Sales from '@/pages/Sales';
import CarDetails from '@/pages/CarDetails';
import Repairs from '@/pages/Repairs';
import BodyWorks from '@/pages/BodyWorks';
import Parts from '@/pages/Parts';
import PartDetails from '@/pages/PartDetails';
import Fleet from '@/pages/Fleet';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Search from '@/pages/Search';
import Faqs from '@/pages/Faqs';
import Gallery from '@/pages/Gallery';
import Careers from '@/pages/Careers';
import Sitemap from '@/pages/Sitemap';
import NotFound from '@/pages/NotFound';

// Service Area Pages
import ServiceAreas from '@/pages/service-areas/ServiceAreas';
import ServiceAreaDetails from '@/pages/service-areas/ServiceAreaDetails';
import ServiceAreaTowingService from '@/pages/service-areas/ServiceAreaTowingService';

// Policy & Legal Pages
import PrivacyPolicy from '@/pages/policies/PrivacyPolicy';
import TermsConditions from '@/pages/policies/TermsConditions';
import TowingServiceTerms from '@/pages/policies/TowingServiceTerms';
import CancellationRefundPolicy from '@/pages/policies/CancellationRefundPolicy';
import PricingPaymentPolicy from '@/pages/policies/PricingPaymentPolicy';
import Disclaimer from '@/pages/policies/Disclaimer';
import CookiePolicy from '@/pages/policies/CookiePolicy';
import ServiceAreaPolicy from '@/pages/policies/ServiceAreaPolicy';
import EmergencyServicePolicy from '@/pages/policies/EmergencyServicePolicy';
import ComplaintsPolicy from '@/pages/policies/ComplaintsPolicy';
import CarDamageLiabilityPolicy from '@/pages/policies/CarDamageLiabilityPolicy';
import AccessibilityStatement from '@/pages/policies/AccessibilityStatement';

function AdminShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Admin Login Gate & Protected Console Routes */}
      <Route element={<AdminShell />}>
        <Route path="/nanadmin" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route
            path="colors"
            element={
              <AdminProtectedRoute requiredRole="admin">
                <AdminColors />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="logo"
            element={
              <AdminProtectedRoute requiredRole="admin">
                <AdminLogo />
              </AdminProtectedRoute>
            }
          />
          <Route path="links" element={<AdminLinks />} />
          <Route path="pages-text" element={<AdminPagesText />} />
          <Route path="images" element={<AdminImages />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="receipts" element={<AdminReceipts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="image-studio" element={<AdminImageStudio />} />
          <Route path="doc-settings" element={<AdminDocSettings />} />
          <Route path="backup" element={<AdminBackupExport />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Public Application Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/haulage" element={<Haulage />} />
        <Route path="/towing" element={<Towing />} />

        {/* Service Areas (261 corridor routes + advert districts resolved via ServiceAreaDetails) */}
        <Route path="/service-areas" element={<ServiceAreas />} />
        <Route path="/service-areas/:areaSlug" element={<ServiceAreaDetails />} />
        <Route path="/service-areas/:areaSlug/:serviceSlug" element={<ServiceAreaTowingService />} />

        {/* Inventory, Workshop & Fleet */}
        <Route path="/rental" element={<Rental />} />
        <Route path="/rental/:id" element={<RentalDetails />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/:id" element={<CarDetails />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/body-works" element={<BodyWorks />} />
        <Route path="/parts" element={<Parts />} />
        <Route path="/parts/:id" element={<PartDetails />} />
        <Route path="/fleet" element={<Fleet />} />

        {/* Editorial, Info & Discovery */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Policies & Legal */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/towing-service-terms" element={<TowingServiceTerms />} />
        <Route path="/cancellation-refund-policy" element={<CancellationRefundPolicy />} />
        <Route path="/pricing-payment-policy" element={<PricingPaymentPolicy />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/service-area-policy" element={<ServiceAreaPolicy />} />
        <Route path="/emergency-service-policy" element={<EmergencyServicePolicy />} />
        <Route path="/complaints-policy" element={<ComplaintsPolicy />} />
        <Route path="/car-damage-liability-policy" element={<CarDamageLiabilityPolicy />} />
        <Route path="/accessibility-statement" element={<AccessibilityStatement />} />

        {/* Legacy Redirects */}
        <Route path="/vehicle-damage-liability-policy" element={<Navigate to="/car-damage-liability-policy" replace />} />
        <Route path="/vehicles" element={<Navigate to="/sales" replace />} />
        <Route path="/cars" element={<Navigate to="/sales" replace />} />
        <Route path="/car-sales" element={<Navigate to="/sales" replace />} />
        <Route path="/vehicle-sales" element={<Navigate to="/sales" replace />} />
        <Route path="/vehicles/:id" element={<Navigate to="/sales" replace />} />
        <Route path="/cars/:id" element={<Navigate to="/sales" replace />} />
        <Route path="/vehicle-details/:id" element={<Navigate to="/sales" replace />} />
        <Route path="/car-details/:id" element={<Navigate to="/sales" replace />} />
        <Route path="/car-rentals" element={<Navigate to="/rental" replace />} />
        <Route path="/vehicle-rentals" element={<Navigate to="/rental" replace />} />
        <Route path="/car-rental" element={<Navigate to="/rental" replace />} />
        <Route path="/vehicle-rental" element={<Navigate to="/rental" replace />} />
        <Route path="/about" element={<Navigate to="/#about" replace />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
