// src/ComplaintForm.jsx
import React, { useState } from 'react';

// Accept the onComplaintSubmit function as a prop
export default function ComplaintForm({ onComplaintSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
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

    try {
      // Call the function passed from App.jsx instead of calling the API directly
      await onComplaintSubmit(formData);
      setFormData({ name: '', email: '', date: '', hour: '', description: '' });
      setMessage({ type: 'success', text: 'Reclamação enviada com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Falha ao enviar reclamação. Tente novamente.' });
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
          <label className="form-label" htmlFor="name">
            Nome do Usuário
          </label>
          <input
            type="text"
            id="name" // unique key? ... autoincrement...
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="retro-input"
            placeholder="Digite seu nome..."
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="retro-input"
            placeholder="Digite seu email..."
            required
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label" htmlFor="description">
            Descrição do Problema
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="retro-textarea"
            placeholder="Descreva seu problema detalhadamente..."
            required
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
