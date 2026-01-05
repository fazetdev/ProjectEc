'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivateHub() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Simple password - you'll replace with real auth
  const correctPassword = 'Fazet2024'; // CHANGE THIS TO YOUR REAL PASSWORD

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    try {
      // Simple password check
      if (password === correctPassword) {
        // Store auth token in localStorage
        localStorage.setItem('fazet_auth', 'authenticated');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError('Access denied. Invalid password.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-4">
      {/* Fazet Business Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
          <span className="text-3xl font-bold">F</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fazet Business
          </span>
        </h1>
        
        <div className="inline-flex items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
          <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          <p className="text-sm font-medium text-gray-300">
            Private Enterprise Hub
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                disabled={isAuthenticating}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating || !password}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isAuthenticating || !password
                  ? 'bg-gray-800 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white'
              }`}
            >
              {isAuthenticating ? 'Authenticating...' : 'Enter Hub'}
            </button>
          </form>
        </div>

        {/* Simple Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure enterprise access • v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
