import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ProductDetails from './pages/ProductDetails';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './containers/ProductList';
import OrderList from './containers/OrderList';
import UserProfile from './components/UserProfile';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ProductProvider>
        <OrderProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
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
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </OrderProvider>
      </ProductProvider>
    </ClerkProvider>
  );
}

export default App;
