import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Context Providers
import { ProductProvider } from "./context/ProductContext";
import { OrderProvider } from "./context/OrderContext";
import { CartProvider } from "./context/CartContext";

// Auth
import { authService } from "./services/auth";
import ProtectedRoute, { AuthRedirect } from "./components/auth/ProtectedRoute";

// Layout Components
import Layout from "./components/layout/Layout";

// Pages
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import FarmerDashboard from "./pages/dashboards/FarmerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
// import NotFoundPage from "./pages/NotFoundPage";
import NotFoundPage from "./pages/NotFoundpage";
import AuthLanding from "./components/auth/AuthLanding";

// Feature Pages & Components
import ProductList from "./containers/ProductList";
import ProductDetails from "./pages/ProductDetails";
import OrderList from "./containers/OrderList";
import OrderDetails from "./pages/OrderDetails";
import UserProfile from "./components/UserProfile";

function AppContent() {
  const { isLoaded, user, isSignedIn, getToken } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initializeUser() {
      if (isLoaded && isSignedIn && user) {
        try {
          const userData = await authService.initializeSession(user, getToken);
          setUserRole(userData.role);
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to initialize user:', error);
          setIsInitialized(true);
        }
      } else if (isLoaded && !isSignedIn) {
        setIsInitialized(true);
        setUserRole(null);
      }
    }

    initializeUser();
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLanding />} />
        <Route path="/sign-in/*" element={<Login />} />
        <Route path="/sign-up/*" element={<Register />} />
        <Route path="/sso-callback" element={<Login />} />
        
        {/* Protected Customer Routes */}
        <Route
          path="/dashboard/customer/*"
          element={
            <ProtectedRoute allowedRoles={['customer']} userRole={userRole}> {/* Pass userRole */}
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Farmer Routes */}
        <Route
          path="/dashboard/farmer/*"
          element={
            <ProtectedRoute allowedRoles={['farmer']} userRole={userRole}> {/* Pass userRole */}
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']} userRole={userRole}> {/* Pass userRole */}
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Redirect */}
        <Route path="/dashboard" element={<AuthRedirect userRole={userRole} />} /> {/* Pass userRole */}
        
        {/* Public Product Routes */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <ClerkProvider 
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      navigate={(to) => {
        console.log("Navigating to:", to);
        window.location.href = to;
      }}
    >
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <CartProvider>
              <ProductProvider>
                <OrderProvider>
                  <AppContent />
                  <Toaster />
                  <Sonner />
                </OrderProvider>
              </ProductProvider>
            </CartProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </Router>
    </ClerkProvider>
  );
}

export default App;
