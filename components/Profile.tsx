import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    const success = changePassword(oldPassword, newPassword);
    if (success) {
      setMessage('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage('Incorrect old password');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-slate-800 p-6 text-white text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-3">
            {user?.name.charAt(0)}
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-slate-400 text-sm">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-slate-700 rounded-full text-xs uppercase tracking-wider">
            {user?.role}
        </span>
      </div>

      <div className="p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input 
              type="password" required 
              className="w-full border rounded-md p-2"
              value={oldPassword} onChange={e => setOldPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input 
              type="password" required 
              className="w-full border rounded-md p-2"
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
            <input 
              type="password" required 
              className="w-full border rounded-md p-2"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
          
          {message && (
            <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-md font-medium transition-colors">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
