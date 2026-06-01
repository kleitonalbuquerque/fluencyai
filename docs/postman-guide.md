# Guia de Endpoints e Postman — FluencyAI

Este documento explica como documentar os endpoints da API e como utilizá-los no Postman, incluindo autenticação automática com JWT e exemplos de body para cada rota.

---

## 1. Configuração do Ambiente no Postman

### 1.1 Criar o Environment

No Postman, crie um **Environment** chamado `FluencyAI Local` com as seguintes variáveis:

| Variável | Valor inicial | Descrição |
|---|---|---|
| `base_url` | `http://localhost:8000` | URL base da API |
| `access_token` | *(vazio)* | Preenchido automaticamente após login |
| `refresh_token` | *(vazio)* | Preenchido automaticamente após login |

### 1.2 Criar a Collection

Crie uma **Collection** chamada `FluencyAI API` com as seguintes pastas:

```
FluencyAI API/
├── Auth/
├── Learning Tracks/
├── Immersion Plan/
├── AI Chat/
├── Memorization/
├── Role Play/
├── Gamification/
├── Social/
└── Knowledge Base/
```

### 1.3 Script de autenticação automática (Collection Pre-request)

Na aba **Pre-request Script** da **Collection** (não de uma request individual), cole o script abaixo. Ele injeta o `access_token` em todas as requisições autenticadas automaticamente:

```javascript
// Não executa em rotas públicas
const publicRoutes = ["/login", "/signup", "/password-reset/request"];
const requestUrl = pm.request.url.getPath();
const isPublic = publicRoutes.some(route => requestUrl.includes(route));

if (!isPublic) {
    pm.request.headers.upsert({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("access_token")
    });
}
```

### 1.4 Script de captura automática do token (Post-response)

Na aba **Tests** da **Collection**, cole o script abaixo. Ele salva os tokens sempre que uma resposta contiver `access_token`:

```javascript
const response = pm.response.json();
if (response && response.access_token) {
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("refresh_token", response.refresh_token);
    console.log("Tokens salvos no environment.");
}
```

---

## 2. Como documentar cada endpoint no Postman

Para cada request, preencha:

1. **Name**: nome descritivo (ex: `Login`)
2. **Description** (aba Docs): objetivo da rota, pré-condições, erros esperados
3. **Params / Headers / Body**: configure conforme as seções abaixo
4. **Tests**: scripts de validação e captura de variáveis

---

## 3. Referência completa de endpoints

### 3.1 Auth

#### POST `/signup`
Cria uma nova conta.

- **Auth**: não requer token
- **Body** (JSON):
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha-forte-123"
}
```
- **Respostas**:
  - `201` — conta criada, retorna `access_token`, `refresh_token` e dados do usuário
  - `409` — e-mail já cadastrado

---

#### POST `/login`
Autentica o usuário.

- **Auth**: não requer token
- **Body** (JSON):
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha-forte-123"
}
```
- **Respostas**:
  - `200` — retorna `access_token`, `refresh_token` e dados do usuário
  - `401` — credenciais inválidas

> Após o login, o script de Tests da Collection salva os tokens automaticamente.

---

#### POST `/refresh`
Renova o `access_token` usando o `refresh_token`.

- **Auth**: não requer `Authorization` header
- **Body** (JSON):
```json
{
  "refresh_token": "{{refresh_token}}"
}
```
- **Respostas**:
  - `200` — novos tokens
  - `401` — refresh token inválido ou expirado

---

#### POST `/password-reset/request`
Solicita reset de senha.

- **Auth**: não requer token
- **Body** (JSON):
```json
{
  "email": "usuario@exemplo.com"
}
```
- **Respostas**:
  - `200` — retorna token de reset (em produção seria enviado por e-mail)

---

#### GET `/me`
Retorna os dados do usuário autenticado.

- **Auth**: Bearer token (injetado automaticamente)
- **Body**: nenhum
- **Respostas**:
  - `200` — `id`, `email`, `xp`, `level`, `streak`, `avatar_url`

---

#### PATCH `/me/password`
Altera a senha do usuário.

- **Auth**: Bearer token
- **Body** (JSON):
```json
{
  "current_password": "senha-atual",
  "new_password": "nova-senha-forte"
}
```
- **Respostas**:
  - `200` — senha alterada
  - `401` — senha atual incorreta

---

#### PUT `/me/avatar`
Atualiza o avatar do usuário.

- **Auth**: Bearer token
- **Body** (JSON):
```json
{
  "avatar_url": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```
- **Respostas**:
  - `200` — retorna usuário atualizado
  - `422` — URL não é um data URL de imagem válido

---

### 3.2 Learning Tracks

#### GET `/learning-tracks`
Lista todos os tracks de aprendizado disponíveis.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — lista de `{ slug, label, description, position }`

---

#### GET `/learning-tracks/active`
Retorna o track ativo do usuário.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — track atual

---

#### PUT `/learning-tracks/active`
Define o track ativo.

- **Auth**: Bearer token
- **Body** (JSON):
```json
{
  "track_slug": "english-foundation"
}
```
- **Respostas**:
  - `200` — track atualizado
  - `404` — track não encontrado

---

### 3.3 Immersion Plan

#### GET `/learning-plan/today`
Plano do dia atual do usuário.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — conteúdo completo do dia atual

---

#### GET `/learning-plan/weekly?week_offset=0`
Roadmap semanal com dias bloqueados, atuais e completos.

- **Auth**: Bearer token
- **Query Params**:
  - `week_offset` (int, padrão `0`): semanas relativas à atual (ex: `-1` = semana passada)
- **Respostas**:
  - `200` — lista de 7 dias com `status` (`locked`, `current`, `completed`)

---

#### GET `/learning-plan/day/{day}`
Conteúdo completo do dia com progresso por seção.

- **Auth**: Bearer token
- **Path Params**:
  - `day` (int): número do dia (ex: `1`)
- **Respostas**:
  - `200` — frases, vocabulário, gramática, prática, fala, quiz + progresso
  - `403` — dia bloqueado
  - `404` — dia não encontrado

---

#### POST `/learning-plan/day/{day}/items/{section}/{item_key}/complete`
Marca um item individual como concluído.

- **Auth**: Bearer token
- **Path Params**:
  - `day`: número do dia
  - `section`: chave da seção (`phrases`, `vocabulary`, `grammar`, `grammar_practice`, `speaking`, `quiz`)
  - `item_key`: chave do item (obtida na resposta do `GET /learning-plan/day/{day}`)
- **Body** (JSON, opcional — obrigatório para quiz e prática):
```json
{
  "answer": "resposta do usuário"
}
```
- **Respostas**:
  - `200` — item marcado como completo
  - `403` — dia bloqueado
  - `422` — seção ou item inválido

---

#### DELETE `/learning-plan/day/{day}/items/{section}/{item_key}/complete`
Desmarca um item como concluído.

- **Auth**: Bearer token
- **Path Params**: mesmos do POST acima
- **Body**: nenhum
- **Respostas**:
  - `200` — item desmarcado

---

#### POST `/learning-plan/day/{day}/sections/{section}/complete`
Finaliza uma seção inteira do dia.

- **Auth**: Bearer token
- **Pré-condição**: todos os itens da seção devem estar completos
- **Path Params**:
  - `day`: número do dia
  - `section`: `phrases`, `vocabulary`, `grammar`, `grammar_practice`, `speaking` ou `quiz`
- **Body**: nenhum
- **Respostas**:
  - `200` — seção concluída, retorna XP e progresso total
  - `409` — itens da seção ainda não foram todos completados
  - `403` — dia bloqueado
  - `422` — seção inválida

> Fluxo correto: complete todos os itens → depois chame esta rota para finalizar a seção.

---

#### GET `/learning-plan/history`
Lista histórico de dias com progresso.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — lista de dias disponíveis para revisão

---

#### GET `/learning-plan/history/day/{day}`
Conteúdo de um dia anterior para revisão (somente leitura).

- **Auth**: Bearer token
- **Respostas**:
  - `200` — conteúdo + progresso original (não gera XP duplicado)
  - `403` / `404` — dia bloqueado ou não encontrado

---

### 3.4 AI Chat

#### POST `/ai/chat`
Conversa com IA usando a knowledge base como contexto.

- **Auth**: Bearer token
- **Requer**: `GEMINI_API_KEY` configurado no `.env`
- **Body** (JSON):
```json
{
  "message": "How do I say 'I'm hungry' naturally in English?"
}
```
- **Respostas**:
  - `200` — `{ "reply": "...", "correction": "...", "vocabulary_tip": "..." }`

---

### 3.5 Memorization

#### GET `/memorization/session`
Retorna uma sessão de memorização com palavras e dicas.

- **Auth**: Bearer token
- **Body**: nenhum
- **Respostas**:
  - `200` — lista de `VocabularyWord` com `word`, `definition`, `example_sentence`, `memory_tip`

---

### 3.6 Role Play

#### GET `/role-play/scenarios`
Lista cenários disponíveis para role play.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — lista de cenários com `id`, `title`, `description`

---

#### POST `/role-play/respond`
Envia resposta do usuário em um cenário e recebe feedback da IA.

- **Auth**: Bearer token
- **Body** (JSON):
```json
{
  "scenario": "job-interview",
  "message": "I have five years of experience in software development."
}
```
- **Respostas**:
  - `200` — `{ "feedback": "...", "correction": "...", "next_prompt": "..." }`

---

### 3.7 Gamification

#### GET `/gamification/summary`
Resumo de XP, level, streak e ranking do usuário.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — `{ "xp", "level", "streak", "rank_position", ... }`

---

#### GET `/ranking/global`
Ranking global de todos os usuários.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — lista de usuários ordenada por XP

---

### 3.8 Social

#### GET `/social/share/progress`
Gera texto/dados para compartilhamento do progresso.

- **Auth**: Bearer token
- **Respostas**:
  - `200` — `{ "message": "...", "xp", "streak", "level" }`

---

### 3.9 Knowledge Base (Admin)

> Todos os endpoints desta seção exigem que o usuário seja **admin** (verificado via `get_knowledge_manager_user` no backend).

#### GET `/knowledge/sources`
Lista documentos na knowledge base.

- **Auth**: Bearer token (admin)
- **Respostas**:
  - `200` — lista de `{ id, name, type, last_updated }`

---

#### GET `/knowledge/sources/{source_id}`
Retorna conteúdo completo de um documento.

- **Auth**: Bearer token (admin)
- **Path Params**:
  - `source_id`: nome do arquivo (ex: `imersao-dia-01.md`)
- **Respostas**:
  - `200` — metadados + `content`
  - `404` — documento não encontrado
  - `400` — `source_id` inválido ou extensão não suportada

---

#### POST `/knowledge/upload`
Faz upload de um documento `.md` ou `.pdf`.

- **Auth**: Bearer token (admin)
- **Body**: `multipart/form-data` com campo `file`

No Postman:
1. Selecione `Body` → `form-data`
2. Adicione uma chave `file` com tipo `File`
3. Selecione o arquivo `.md` ou `.pdf`

- **Respostas**:
  - `201` — `{ "message": "File 'nome.md' uploaded successfully" }`
  - `400` — extensão não suportada

---

#### DELETE `/knowledge/sources/{source_id}`
Remove um documento da knowledge base.

- **Auth**: Bearer token (admin)
- **Path Params**:
  - `source_id`: nome do arquivo (ex: `imersao-dia-01.md`)
- **Respostas**:
  - `204` — removido com sucesso
  - `404` — não encontrado

---

## 4. Fluxo completo de teste no Postman

Use esta sequência para validar a implementação de ponta a ponta:

```
1. POST /signup               → cria usuário (tokens salvos automaticamente)
2. GET  /me                   → confirma dados do usuário
3. GET  /learning-tracks      → lista tracks disponíveis
4. GET  /learning-plan/weekly → confere roadmap da semana
5. GET  /learning-plan/day/1  → carrega conteúdo do Dia 1
   → copie os item_keys de cada seção para usar nos passos abaixo
6. POST /learning-plan/day/1/items/phrases/{key}/complete    (repita para todos os itens)
7. POST /learning-plan/day/1/sections/phrases/complete
8. (repita passos 6-7 para vocabulary, grammar, grammar_practice, speaking, quiz)
9. GET  /gamification/summary → confirma XP adicionado
10. POST /ai/chat             → testa conversa com IA
11. GET  /memorization/session → sessão de vocabulário
12. GET  /role-play/scenarios  → lista cenários
13. POST /role-play/respond    → responde um cenário
14. GET  /ranking/global       → verifica posição no ranking
```

---

## 5. Variáveis de ambiente úteis no Postman

Além de `base_url`, `access_token` e `refresh_token`, você pode criar variáveis para agilizar testes:

| Variável | Exemplo de valor |
|---|---|
| `test_email` | `dev@fluencyai.com` |
| `test_password` | `dev-password-123` |
| `current_day` | `1` |
| `current_section` | `phrases` |
| `item_key` | `1` |

Nos bodies, use `{{variavel}}` para referenciar:
```json
{
  "email": "{{test_email}}",
  "password": "{{test_password}}"
}
```

---

## 6. Swagger como alternativa

O FastAPI expõe documentação interativa automática em:

```
http://localhost:8000/docs       ← Swagger UI (teste manual)
http://localhost:8000/openapi.json ← schema OpenAPI bruto
```

Para autenticar no Swagger:
1. Chame `POST /login` pelo Swagger
2. Copie o `access_token` da resposta
3. Clique em **Authorize** (canto superior direito)
4. Cole apenas o valor do token (sem `Bearer `)
5. Confirme — todos os endpoints passam a usar o token automaticamente
