# Sistema de Reclamações Tech Site

Este é um projeto de exemplo que consiste em uma aplicação web para registrar e visualizar reclamações/problemas de computador. A aplicação é dividida em um frontend desenvolvido com React (usando Vite) e um backend com Node.js, Express e um banco de dados SQLite.

## Tecnologias Utilizadas

- **Frontend**:
  - React
  - Vite
  - Axios
- **Backend**:
  - Node.js
  - Express
  - SQLite3
  - CORS

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente instalado com o Node.js)

## Instalação e Configuração

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

1. **Clone o repositório:**

    ```bash
    git clone <url-do-seu-repositorio>
    cd tech-site-ui
    ```

2. **Instale as dependências do Backend:**

    ```bash
    cd backend
    npm install
    cd ..
    ```

3. **Instale as dependências do Frontend:**

    ```bash
    npm install
    ```

## Como Executar a Aplicação

Você precisará de dois terminais para executar o frontend e o backend simultaneamente.

1. **Inicie o Servidor Backend:**
    - Abra um terminal, navegue até a pasta `backend` e execute:

    ```bash
    cd backend
    node server.js
    ```

    - O servidor backend estará rodando em `http://localhost:3001`.

2. **Inicie a Aplicação Frontend:**
    - Abra um segundo terminal na raiz do projeto (`tech-site-ui`) e execute:

    ```bash
    npm run dev
    ```

    - A aplicação frontend estará acessível em `http://localhost:5173` (ou na porta indicada pelo Vite).

## Endpoints da API

A API do backend fornece os seguintes endpoints:

- `GET /api/complaints`: Retorna uma lista de todas as reclamações.
- `POST /api/complaints`: Cria uma nova reclamação. O corpo da requisição deve ser um JSON com `user`, `complaint`, e `email`.
