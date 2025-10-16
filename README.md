# Sistema de Reclamações Tech Site

Este é um projeto de aplicação web para registrar e visualizar reclamações/problemas de computador. A aplicação possui autenticação de usuários com controle de permissões (usuário comum e administrador) e é dividida em um frontend desenvolvido com React (usando Vite) e um backend com Node.js, Express e um banco de dados SQLite.

## Tecnologias Utilizadas

- **Frontend**:
  - React 19
  - Vite (com proxy para desenvolvimento)
  - Axios (cliente HTTP)
  - Vitest (testes)
- **Backend**:
  - Node.js + Express
  - SQLite3 (banco de dados)
  - JWT (autenticação)
  - bcryptjs (hash de senhas)
  - Helmet (segurança)
  - express-rate-limit (proteção contra brute-force)

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente instalado com o Node.js)

## Instalação e Configuração

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### 1. Clone o repositório

```bash
git clone <url-do-seu-repositorio>
cd tech-site
```

### 2. Configure o Backend

```bash
cd backend
npm install

# Copie o arquivo de exemplo e configure as variáveis de ambiente
Copy-Item .env.example .env
# Edite o arquivo .env se necessário (especialmente JWT_SECRET em produção)
```

**Variáveis de ambiente importantes** (arquivo `backend/.env`):
- `NODE_ENV` - ambiente (development ou production)
- `PORT` - porta do servidor (padrão: 3001)
- `JWT_SECRET` - chave secreta para tokens JWT (mude em produção!)
- `FRONTEND_ORIGIN` - origem do frontend em produção (deixe vazio em desenvolvimento)

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
```

## Como Executar a Aplicação

Você precisará de dois terminais para executar o frontend e o backend simultaneamente.

### Terminal 1 - Backend

```bash
cd backend
node server.js
```

O servidor backend estará rodando em `http://localhost:3001`.

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

A aplicação frontend estará acessível em `http://localhost:5173` (ou na porta indicada pelo Vite).

## Arquitetura de Desenvolvimento

### Proxy Vite

Durante o desenvolvimento, o Vite está configurado para fazer proxy das requisições que começam com `/api` para o backend em `http://localhost:3001`. Isso significa:

- O frontend faz requisições relativas (ex: `/api/auth/login`)
- O Vite intercepta e encaminha para `http://localhost:3001/api/auth/login`
- Elimina problemas de CORS durante o desenvolvimento
- O código do frontend usa URLs relativas que funcionam tanto em dev quanto em produção

Configuração em `frontend/vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:3001',
  },
}
```

## Autenticação

O sistema possui autenticação baseada em JWT (JSON Web Tokens):

- **Registro**: POST `/api/auth/register` - cria novo usuário (role: 'user')
- **Login**: POST `/api/auth/login` - retorna token JWT válido por 24h
- **Token**: armazenado no `localStorage` e enviado via header `Authorization: Bearer <token>`
- **Usuário admin padrão**:
  - Username: `admin`
  - Password: `admin123`

## Endpoints da API

### Autenticação (públicos)
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

### Gerenciamento de Usuários (apenas admin)
- `GET /api/auth/users` - Lista todos os usuários
- `DELETE /api/auth/users/:id` - Remove um usuário
- `PUT /api/auth/users/:id/role` - Altera role de um usuário

### Reclamações (autenticados)
- `GET /api/complaints` - Lista reclamações (admins veem emails, usuários comuns não)
- `POST /api/complaints` - Cria nova reclamação (campos: `user`, `complaint`, `email`)
- `DELETE /api/complaints/:id` - Remove reclamação (apenas admin)

## Estrutura do Projeto

```
tech-site/
├── backend/
│   ├── db/
│   │   └── complaints.db          # Banco SQLite (criado automaticamente)
│   ├── middleware/
│   │   └── auth.js                # Middleware de autenticação JWT
│   ├── routes/
│   │   ├── auth.js                # Rotas de autenticação e usuários
│   │   └── complaints.js          # Rotas de reclamações
│   ├── .env.example               # Exemplo de variáveis de ambiente
│   ├── package.json
│   └── server.js                  # Servidor Express principal
├── frontend/
│   ├── src/
│   │   ├── api.js                 # Cliente Axios configurado
│   │   ├── App.jsx                # Componente principal
│   │   ├── Login.jsx              # Tela de login
│   │   ├── Register.jsx           # Tela de registro
│   │   ├── ComplaintForm.jsx      # Formulário de reclamação
│   │   ├── ComplaintList.jsx      # Lista de reclamações
│   │   └── UserManagement.jsx     # Gerenciamento de usuários (admin)
│   ├── vite.config.js             # Configuração do Vite (inclui proxy)
│   └── package.json
└── README.md
```

## Testes

O frontend possui configuração para testes com Vitest:

```bash
cd frontend
npm test          # Modo watch
npm run test:run  # Execução única
```

## Segurança

O projeto implementa várias camadas de segurança:

- ✅ Autenticação JWT com tokens de 24h
- ✅ Senhas hasheadas com bcrypt
- ✅ Rate limiting (proteção contra brute-force)
- ✅ Helmet (headers de segurança HTTP)
- ✅ Validação de entrada com express-validator
- ✅ Queries parametrizadas (proteção contra SQL injection)
- ✅ CORS configurável por ambiente

**Importante para produção:**
- Altere o `JWT_SECRET` para um valor forte e aleatório
- Configure `FRONTEND_ORIGIN` com o domínio real do frontend
- Defina `NODE_ENV=production`
- Use HTTPS (SSL/TLS)
- Considere usar cookies HttpOnly ao invés de localStorage para tokens

## Notas de Desenvolvimento

- O banco de dados SQLite é criado automaticamente em `backend/db/complaints.db`
- As tabelas (`users` e `complaints`) são criadas automaticamente na primeira execução
- O usuário admin padrão é criado automaticamente
- Logs de debug estão ativos em modo desenvolvimento
- A rota `/api/auth/reset-admin` é um helper de desenvolvimento (remover em produção)
