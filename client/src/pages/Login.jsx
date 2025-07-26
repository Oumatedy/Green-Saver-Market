import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your Green Saver Market account
          </p>
        </div>
        <SignIn
          routing="path"
          path="/login"
          redirectUrl="/products"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "rounded-lg shadow-md p-6",
              headerTitle: "text-2xl font-bold text-center mb-4",
              formButtonPrimary: "w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;
