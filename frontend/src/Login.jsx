import React, { useState } from 'react';
import { login } from './api';

export default function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Sistema indisponível. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crt-monitor">
      <div className="terminal-header">
        <div className="terminal-title">
          ████ TECHSITE SISTEMA ████
        </div>
        <div className="terminal-subtitle">
          &gt; ACESSO RESTRITO - AUTORIZAÇÃO NECESSÁRIA &lt;
        </div>
      </div>

      <div className="terminal-window">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', color: 'var(--terminal-blue)' }}>
            &gt; INSERIR CREDENCIAIS DE ACESSO:
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            USUÁRIO:
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="terminal-input"
            placeholder="Digite seu usuário..."
            required
          />

          <div style={{ marginBottom: '10px' }}>
            SENHA:
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="terminal-input"
            placeholder="Digite sua senha..."
            required
          />

          {error && (
            <div className="terminal-error" style={{ marginBottom: '15px' }}>
              ⚠ ERRO: {error}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              type="submit" 
              className="terminal-button"
              disabled={loading}
            >
              {loading ? 'PROCESSANDO...' : '► ACESSAR SISTEMA'}
            </button>
            
            <button 
              type="button" 
              className="terminal-button"
              onClick={onShowRegister}
            >
              ► CRIAR CONTA
            </button>
          </div>
        </form>

        <div style={{ 
          marginTop: '30px', 
          fontSize: '14px', 
          color: 'var(--terminal-amber)',
          textAlign: 'center'
        }}>
          █ STATUS: SISTEMA ONLINE █<span className="blink">_</span>
        </div>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        right: '30px', 
        fontSize: '12px',
        color: 'var(--terminal-blue)'
      }}>
        TECHSITE v2.0 © 1999
      </div>
    </div>
  );
}