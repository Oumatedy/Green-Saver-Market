import React from 'react';
import { useUser } from '@clerk/clerk-react';

const UserProfile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <img
          src={user.profileImageUrl}
          alt={user.fullName}
          className="w-20 h-20 rounded-full mr-4"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.fullName}</h2>
          <p className="text-gray-600">{user.primaryEmailAddress.emailAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span> {user.fullName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.primaryEmailAddress.emailAddress}
            </p>
            <p>
              <span className="font-medium">Member since:</span>{' '}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
          <div className="space-y-4">
            <button
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors w-full"
              onClick={() => {/* Update profile functionality */}}
            >
              Update Profile
            </button>
            <button
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors w-full"
              onClick={() => {/* Change password functionality */}}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
