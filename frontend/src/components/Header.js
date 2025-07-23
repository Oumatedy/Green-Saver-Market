import React from 'react';
import { Link } from 'react-router-dom';
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
              Green Saver Market
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/products"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Products
            </Link>
            {isSignedIn && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
            </Link>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
