// src/ComplaintForm.jsx
import React, { useState } from 'react';

// Accept the onComplaintSubmit function as a prop
export default function ComplaintForm({ onComplaintSubmit }) {
  const [formData, setFormData] = useState({
    user: '',        // Changed from 'name' to 'user' (backend expects 'user')
    email: '',       // Keep this
    complaint: '',   // Changed from 'description' to 'complaint' (backend expects 'complaint')
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Send exactly what backend expects
    const backendFormData = {
      user: formData.user,
      complaint: formData.complaint,
      email: formData.email
    };

    console.log('Sending exactly what backend expects:', backendFormData);

    try {
      await onComplaintSubmit(backendFormData);
      setFormData({ 
        user: '', 
        email: '', 
        complaint: ''
      });
      setMessage({ type: 'success', text: 'Reclamação enviada com sucesso!' });
    } catch (error) {
      console.error('ComplaintForm error:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Falha ao enviar reclamação. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      className={`retro-form ${loading ? 'form-loading' : ''}`}
      data-title="Nova Reclamação"
      onSubmit={handleSubmit}
    >
      {message.text && (
        <div className={`form-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="user">
            Seu Nome
          </label>
          <input
            type="text"
            id="user"
            name="user"
            value={formData.user}
            onChange={handleChange}
            className="retro-input"
            placeholder="Digite seu nome"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Seu Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="retro-input"
            placeholder="Digite seu email"
            required
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label" htmlFor="complaint">
            Descrição da Reclamação
          </label>
          <textarea
            id="complaint"
            name="complaint"
            value={formData.complaint}
            onChange={handleChange}
            className="retro-textarea"
            placeholder="Descreva seu problema detalhadamente: empresa, produto, o que aconteceu..."
            required
            rows="6"
          />
        </div>
      </div>

      <div className="form-actions center">
        <button 
          type="submit" 
          className="retro-button primary"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Reclamação'}
        </button>
      </div>
    </form>
  );
}
