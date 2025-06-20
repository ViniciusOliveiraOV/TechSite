import { useState } from 'react';
import { login } from './api';

export default function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      const { token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Call parent function to update app state
      onLogin(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-pukeYellow min-h-screen font-retro">
      <h1 className="text-cyberBlue text-4xl mb-4 underline">🔐 Login to Tech Portal</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 bg-white border border-black"
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 bg-white border border-black"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full p-2 bg-cyberBlue text-white border border-black disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        {error && <p className="text-red-600">{error}</p>}
      </form>
      
      <div className="mt-4">
        <button 
          onClick={onShowRegister}
          className="w-full p-2 bg-green-600 text-white border border-black"
        >
          Create New Account
        </button>
      </div>
      
      <div className="mt-4 p-2 bg-white border border-black">
        <p><strong>Demo Admin Account:</strong></p>
        <p>Username: <code>admin</code> | Password: <code>admin123</code></p>
      </div>
    </div>
  );
}