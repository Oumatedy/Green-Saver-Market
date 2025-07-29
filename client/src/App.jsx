import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Layout Components
import Layout from "./components/layout/Layout";

// Pages
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";

// Feature Pages & Components
import ProductList from "./containers/ProductList";
import ProductDetails from "./pages/ProductDetails";
import OrderList from "./containers/OrderList";
import OrderDetails from "./pages/OrderDetails";
import UserProfile from "./components/UserProfile";

// Initialize QueryClient
const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppContent() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Initialize user session when Clerk user is loaded
      authService.initializeSession(user)
        .catch(console.error);
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
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
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth Routes */}
          <Route path="/sign-in/*" element={<Login />} />
          <Route path="/sign-up/*" element={<Register />} />
          <Route path="/sso-callback" element={<Login />} />
          
          {/* Public Product Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
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
