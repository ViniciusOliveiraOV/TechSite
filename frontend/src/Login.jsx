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
      console.log('Attempting login with:', { username, password }); // Debug log
      const response = await login({ username, password });
      console.log('Login response:', response.data); // Debug log
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data); // Debug log
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.details) {
        const details = err.response.data.details.map(d => d.msg).join(', ');
        setError(`Validation errors: ${details}`);
      } else {
        setError('Login failed. Please try again.');
      }
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