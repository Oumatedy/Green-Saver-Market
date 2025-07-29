import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Context Providers
import { ProductProvider } from "./context/ProductContext";
import { OrderProvider } from "./context/OrderContext";

// Page Components
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserProfile from "./components/UserProfile";

// Feature Components
import ProductList from "./containers/ProductList";
import ProductDetails from "./pages/ProductDetails";
import OrderList from "./containers/OrderList";
import OrderDetails from "./pages/OrderDetails";
// import { CartProvider } from "./context/CartContext"; // Uncomment if CartContext used

//  import "./App.css";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* <CartProvider> Uncomment if you want CartContext */}
          <ProductProvider>
            <OrderProvider>
              <Router>
                <div className="min-h-screen flex flex-col">
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:id" element={<ProductDetails />} />
                      <Route path="/orders" element={<OrderList />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </OrderProvider>
          </ProductProvider>
          {/* </CartProvider> */}
          <Toaster />
          <Sonner />
          <Analytics />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
