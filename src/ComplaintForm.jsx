// src/ComplaintForm.jsx
import { useState } from 'react';
import { postComplaint } from './api';

export default function ComplaintForm() {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [complaint, setComplaint] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postComplaint({ user, email, complaint });
      setStatus('Complaint sent ✅');
      setUser('');
      setEmail('');
      setComplaint('');
    } catch (err) {
      setStatus('Something went wrong ❌');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Seu nome" value={user} onChange={(e) => setUser(e.target.value)} required />
      <input placeholder="Seu email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <textarea placeholder="Descreva seu problema..." value={complaint} onChange={(e) => setComplaint(e.target.value)} required />
      <button type="submit">Submit</button>
      <p>{status}</p>
    </form>
  );
}
