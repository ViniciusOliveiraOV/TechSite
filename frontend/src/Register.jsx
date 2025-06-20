import { useState } from 'react';
import { register } from './api';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    try {
      await register({ username, password });
      setSuccess('Account created successfully! You can now log in.');
      
      // Clear form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      
      // Optional: Auto-redirect to login after 2 seconds
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-pukeYellow min-h-screen font-retro">
      <h1 className="text-cyberBlue text-4xl mb-4 underline">📝 Create Account</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full p-2 bg-white border border-black"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            className="w-full p-2 bg-white border border-black"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full p-2 bg-white border border-black"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-2 bg-cyberBlue text-white border border-black disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </form>
      
      <div className="mt-4">
        <button 
          onClick={onBackToLogin}
          className="p-2 bg-gray-500 text-white border border-black"
        >
          ← Back to Login
        </button>
      </div>
      
      <div className="mt-4 p-2 bg-white border border-black">
        <p><strong>Note:</strong> New accounts will be created as regular users (not admin).</p>
        <p>Regular users can create complaints but cannot see emails or delete complaints.</p>
      </div>
    </div>
  );
}