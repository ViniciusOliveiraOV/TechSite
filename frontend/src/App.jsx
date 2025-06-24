import React, { useState, useEffect } from 'react';
import { fetchComplaints, postComplaint, deleteComplaint } from './api';
import ComplaintForm from './ComplaintForm';
import ComplaintList from './ComplaintList';
import Login from './Login';
import Register from './Register';
import UserManagement from './UserManagement';
import './App.css';

const TERMINAL_MESSAGES = {
  welcome: "BEM-VINDO AO TECHSITE!",
  loading: "CARREGANDO SISTEMA...",
  error: "ERRO NO SISTEMA",
  success: "OPERAÇÃO CONCLUÍDA",
  unauthorized: "ACESSO NEGADO",
  processing: "PROCESSANDO..."
};

// Add navigation sections
const NAVIGATION_SECTIONS = [
  { id: 'complaints', label: 'Reclamações'},
  { id: 'analysis', label: 'Análises'},
  { id: 'articles', label: 'Artigos'},
  { id: 'news', label: 'Notícias'},
  { id: 'videos', label: 'Vídeos'},
  { id: 'products', label: 'Produtos'},
  { id: 'tutorials', label: 'Tutoriais'},
  { id: 'about', label: 'Sobre' }
];

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [activeSection, setActiveSection] = useState('complaints'); // Add active section state

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Fetch complaints when user logs in
  useEffect(() => {
    if (user) {
      const getComplaints = async () => {
        try {
          console.log('Fetching complaints for user:', user.username); // Debug log
          const response = await fetchComplaints();
          console.log('Complaints fetched successfully:', response.data); // Debug log
          setComplaints(response.data);
        } catch (error) {
          console.error("Error fetching complaints:", error);
          console.error("Error response:", error.response?.data);
          // If token is invalid, logout user
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('Token invalid, logging out user');
            console.log('footer');
            handleLogout();
          }
        }
      };
      
      // Add a small delay to ensure token is properly set
      setTimeout(getComplaints, 100);
    }
  }, [user]);

  const handleSectionChange = (sectionId) => { 
    setActiveSection(sectionId);
  };

  const handleLogin = (userData) => {
    console.log('Setting user state:', userData);
    setUser(userData);
    setShowRegister(false); // Hide register form after login
    // Remove the undefined setLoginView(false) line
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setComplaints([]);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false); // Go back to login after successful registration
  };

  const handleAddComplaint = async (formData) => {
    console.log('App.jsx - Sending formData:', formData); // Debug log
    try {
      const response = await postComplaint(formData);
      console.log('App.jsx - Response:', response.data); // Debug log
      setComplaints([...complaints, response.data]);
    } catch (error) {
      console.error("Failed to post complaint:", error);
      console.error("Error details:", error.response?.data); // More detailed error
      console.error("Status:", error.response?.status); // HTTP status
      console.log('Form data that failed:', formData);
      
      // Show user-friendly error
      alert(`Erro ao enviar reclamação: ${error.response?.data?.error || 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id);
      setComplaints(complaints.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      alert("Failed to delete. You may not have permission.");
    }
  };

  if (loading) {
    return <div>{TERMINAL_MESSAGES.loading}</div>;
  }

  // Show register form
  if (showRegister) {
    return (
      <Register 
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Show login if user is not authenticated
  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        onShowRegister={handleShowRegister}
      />
    );
  }

  // Show main app if user is authenticated
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">MENU</div>
        </div>
        <nav className="sidebar-nav">
          {NAVIGATION_SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => handleSectionChange(section.id)}
            >
              <span className="sidebar-icon">{section.icon}</span>
              <span className="sidebar-label">{section.label}</span>
            </button>
          ))}
        </nav>
        
        {/* User info at bottom of sidebar */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user.username.toUpperCase()}</div>
            <div className="user-role">{user.role.toUpperCase()}</div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            ► SAIR
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <div className="crt-monitor">
          <div className="terminal-header">
            <div className="terminal-title">
              ████ PORTAL DE RECLAMAÇÕES ████
            </div>
            <div className="terminal-subtitle">
              &gt; SISTEMA DE GERENCIAMENTO TÉCNICO &lt;
            </div>
          </div>

          <div className="status-bar">
            <div>
              STATUS: <span className="terminal-success">CONECTADO</span><span className="blink">_</span>
            </div>
            <div>
              SEÇÃO: <span className="terminal-warning">{NAVIGATION_SECTIONS.find(s => s.id === activeSection)?.label.toUpperCase()}</span>
            </div>
            <div>
              USUÁRIO: <span className="terminal-blue">{user.username.toUpperCase()}</span>
            </div>
          </div>

          {/* Content based on active section */}
          <div className="content-area">
            {activeSection === 'complaints' && (
              <>
                {user.role === 'admin' && <UserManagement user={user} />}
                <ComplaintForm onComplaintSubmit={handleAddComplaint} />
                <div className="section-divider">
                  <span className="urgent-indicator">🔥 URGENTE!</span>
                  <h2 className="section-title">TODAS AS RECLAMAÇÕES</h2>
                </div>
                <ComplaintList 
                  complaints={complaints} 
                  onDelete={handleDelete}
                  userRole={user.role}
                />
              </>
            )}
            
            {activeSection === 'analysis' && (
              <div className="section-content">
                <h2 className="section-title">📊 ANÁLISES DO SISTEMA</h2>
                <div className="coming-soon">
                  <p>► Estatísticas de reclamações</p>
                  <p>► Relatórios de desempenho</p>
                  <p>► Gráficos de tendências</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'articles' && (
              <div className="section-content">
                <h2 className="section-title">📰 ARTIGOS TÉCNICOS</h2>
                <div className="coming-soon">
                  <p>► Guias de solução de problemas</p>
                  <p>► Artigos sobre hardware</p>
                  <p>► Dicas de manutenção</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'news' && (
              <div className="section-content">
                <h2 className="section-title">📢 NOTÍCIAS TECNOLÓGICAS</h2>
                <div className="coming-soon">
                  <p>► Últimas novidades em tech</p>
                  <p>► Lançamentos de produtos</p>
                  <p>► Atualizações do sistema</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'videos' && (
              <div className="section-content">
                <h2 className="section-title">🎥 TUTORIAIS EM VÍDEO</h2>
                <div className="coming-soon">
                  <p>► Vídeos de reparo</p>
                  <p>► Demonstrações práticas</p>
                  <p>► Cursos online</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'products' && (
              <div className="section-content">
                <h2 className="section-title">🛠️ CATÁLOGO DE PRODUTOS</h2>
                <div className="coming-soon">
                  <p>► Peças de reposição</p>
                  <p>► Ferramentas técnicas</p>
                  <p>► Equipamentos</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'tutorials' && (
              <div className="section-content">
                <h2 className="section-title">📚 TUTORIAIS PASSO-A-PASSO</h2>
                <div className="coming-soon">
                  <p>► Guias de instalação</p>
                  <p>► Procedimentos de reparo</p>
                  <p>► Manuais técnicos</p>
                  <p className="terminal-warning">MÓDULO EM DESENVOLVIMENTO...</p>
                </div>
              </div>
            )}

            {activeSection === 'about' && (
              <div className="section-content">
                <h2 className="section-title">ℹ️ SOBRE O TECHSITE</h2>
                <div className="about-content">
                  <p>████ PORTAL TÉCNICO DESDE 1998 ████</p>
                  <p>Versão: 2.0.1</p>
                  <p>Sistema: LINUX/APACHE</p>
                  <p>Banco de dados: SQLite</p>
                  <p>Interface: RETRO TERMINAL</p>
                  <br />
                  <p>► Suporte técnico especializado</p>
                  <p>► Comunidade ativa de usuários</p>
                  <p>► Banco de dados de soluções</p>
                </div>
              </div>
            )}
          </div>

          <footer className="terminal-footer">
            © 1998 TechPortal.com - Sistema de Gerenciamento Técnico
          </footer>
        </div>
      </div>
    </div>
  );
}