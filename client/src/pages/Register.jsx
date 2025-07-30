import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Green Saver Market and start shopping sustainably
          </p>
        </div>
        <SignUp
          routing="hash"
          afterSignUpUrl="/products"
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

export default Register;
