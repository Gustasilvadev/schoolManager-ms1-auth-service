# 🔐 SchoolManager: MS1 - AuthService

## 1. Visão Geral do Projeto
O SchoolManager é um sistema de gestão escolar desenvolvido para digitalizar e acelerar processos administrativos e acadêmicos de escolas. O foco está na produtividade da secretaria e dos professores. 

O sistema possui uma arquitetura baseada em **microsserviços**, utilizando um API Gateway como ponto de entrada (validando tokens gerados por este serviço) e comunicação híbrida (HTTP/REST para requisições síncronas e RabbitMQ para operações assíncronas). O ecossistema completo conta com 6 microsserviços isolados com seus próprios bancos de dados (MariaDB).

---

## 2. Sobre o AuthService (MS1)
Este repositório contém exclusivamente o código do **MS1 - AuthService**. Ele atua como o coração da segurança e do controle de acesso de todo o ecossistema SchoolManager.

**Domínio:** Identidade, acesso e segurança.

### Responsabilidades Principais
* **Autenticação e Autorização:** Gerenciamento de credenciais de utilizadores.
* **Gestão de Sessões (JWT):** Emissão, assinatura e validação de tokens JWT utilizados pelo API Gateway para liberar o acesso aos demais microsserviços.
* **Controle de Papéis (Roles) e Permissões:** Definição dos dois perfis de utilizador principais: **Administrador** (secretaria/direção) e **Professor**.
* **Vinculação de Entidades:** Manutenção da relação e sincronização entre um utilizador logado no sistema e o seu respectivo perfil nos outros serviços.

### Banco de Dados
Este microsserviço possui seu domínio de dados totalmente isolado, utilizando uma instância de **MariaDB** dedicada apenas às tabelas de usuários, senhas encriptadas e permissões.

---

## 3. Padrão de Commits

Para mantermos o histórico limpo e rastreável, este projeto utiliza a especificação conforme os exemplos abaixo.

**Formato:** `<tipo>: <mensagem curta>`

**Tipos permitidos:**
- `feat`: Nova funcionalidade (ex: criação de nova rota de login).
- `fix`: Correção de bug (ex: ajuste na expiração do token).
- `chore`: Configurações, dependências e estrutura (ex: setup do banco MariaDB).
- `docs`: Atualização de documentação (ex: melhorias neste README).
- `refactor`: Refatoração de código sem alterar regra de negócio.
- `style`: Formatação de código (linting, prettier).
- `test`: Criação/alteração de testes de segurança ou unitários.

---

# 📡 Endpoints da API

## 🔑 Authentication

| Método | Endpoint            | Descrição                      | Auth | Body |
|--------|--------------------|-------------------------------|------|------|
| POST   | `/auth/login`      | Realiza login do usuário      | ❌   | email, password |
| POST   | `/auth/register`   | Registra usuário (TEACHER)    | ❌   | email, password |
| GET    | `/auth/verify`     | Valida token JWT              | ✅   | — |

---

## 👥 Users (Auth)

| Método | Endpoint                          | Descrição                          | Auth | Body |
|--------|----------------------------------|------------------------------------|------|------|
| GET    | `/users/listUsers`               | Lista usuários (com paginação)      | ✅   | — |
| GET    | `/users/listUserById/{id}`       | Busca usuário por ID                | ✅   | — |
| POST   | `/users/createUser`              | Cria novo usuário                  | ✅   | email, password, status, role |
| PUT    | `/users/updateUserById/{id}`     | Atualiza usuário                   | ✅   | email, status |
| DELETE | `/users/deleteUserById/{id}`     | Deleta usuário (lógico)            | ✅   | — |
| POST   | `/users/changePassword`          | Altera senha do usuário            | ✅   | oldPassword, newPassword |

---

## ❤️ Health Check

| Método | Endpoint   | Descrição                  | Auth |
|--------|-----------|---------------------------|------|
| GET    | `/health` | Verifica status da API     | ❌   |

---
