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
| POST   | `/users/createUser`              | Cria novo usuário                  | ✅   | email, password, status, role, teacher_name?, teacher_cpf? |
| PUT    | `/users/updateUserById/{id}`     | Atualiza usuário                   | ✅   | email, status |
| DELETE | `/users/deleteUserById/{id}`     | Deleta usuário (lógico)            | ✅   | — |
| POST   | `/users/changePassword`          | Altera senha do usuário            | ✅   | oldPassword, newPassword |

---

## ❤️ Health Check

| Método | Endpoint   | Descrição                  | Auth |
|--------|-----------|---------------------------|------|
| GET    | `/health` | Verifica status da API     | ❌   |

---

## 📨 Eventos RabbitMQ (Publisher)

| Evento        | Routing Key      | Quando é publicado                          | Payload (campos principais)                          | Consumidor |
|---------------|------------------|--------------------------------------------|------------------------------------------------------|------------|
| `UserCreated` | `user.created`   | Após `POST /users/createUser`              | `user_id`, `user_email`, `role`, `teacher_name`, `teacher_cpf` | MS3        |
| `UserDeleted` | `user.deleted`   | Após `DELETE /users/deleteUserById/{id}`   | `user_id`                                            | MS3        |

**Fluxo automático de criação de professor:**
Quando `teacher_name` e `teacher_cpf` são enviados em `/users/createUser`:

1. **Validação prévia (síncrona via HTTP, com Token Propagation)** — antes de gravar no banco do MS1, são feitas duas chamadas a endpoints do MS3 propagando o `Authorization` do ADMIN que originou a requisição:
   - `GET /api/teachers/byCpf/{cpf}` — se retornar 200, MS1 responde **400 CPF_ALREADY_EXISTS** sem criar o user
   - `GET /api/teachers/byEmail/{email}` — se retornar 200, MS1 responde **400 EMAIL_ALREADY_EXISTS**
   - Se MS3 indisponível/timeout, MS1 responde **503**
2. **Criação do user** no banco do MS1 dentro de `prisma.$transaction` (user + role_user atômicos)
3. **Publish do evento** `UserCreated` no RabbitMQ
4. **Consumer do MS3** cria o registro de professor vinculado ao `user_id`

> **Token Propagation:** o MS1 reaproveita o JWT do ADMIN nas chamadas a `byCpf`/`byEmail` (que agora exigem auth no MS3). A única exceção é `GET /api/teachers/byUser/{userId}`, chamada durante o **login** — nesse momento o token ainda não foi emitido, por isso o endpoint segue interno sem JWT, e o **API Gateway bloqueia o acesso externo** a essa rota via `internalRouteBlocker`.
---
