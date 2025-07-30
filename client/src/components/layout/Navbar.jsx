import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leaf, ShoppingCart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const { itemCount } = useCart();
  const userRole = searchParams.get('role') || 'customer';

  const getRoleColor = (role) => {
    switch (role) {
      case 'farmer': return 'bg-accent text-accent-foreground';
      case 'admin': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-[#1B5E20]" />
          <span className="text-xl font-bold text-[#1B5E20]">Green Saver Market</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/products" className="text-black-600 hover:text-[#1B5E20]">Products</Link>
          <Link to="/about" className="text-black-600 hover:text-[#1B5E20]">About</Link>
          <Link to="/contact" className="text-black-600 hover:text-[#1B5E20]">Contact</Link>
        </div>

        {/* Search Bar - Only for authenticated users */}
        <SignedIn>
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search fresh produce..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
            </div>
          </div>
        </SignedIn>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* Navigation for authenticated users */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-[#1B5E20]">Dashboard</Link>
              {userRole === 'farmer' && (
                <Link to="/my-products" className="text-gray-600 hover:text-[#1B5E20]">My Products</Link>
              )}
              {userRole === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-[#1B5E20]">Admin Panel</Link>
              )}
            </div>

            {/* Role Badge */}
            <Badge className={getRoleColor(userRole)}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>

            {/* Shopping Cart - Only for customers */}
            {userRole === 'customer' && (
              <Button variant="ghost" size="icon" className="relative">
                <Link to="/cart">
                  <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-[#1B5E20]" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#1B5E20]">
                      {itemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {/* User Button */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>

          <SignedOut>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button className="bg-[#1B5E20] hover:bg-[#2E7D32]" asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}