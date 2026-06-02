# Troubleshooting Log

Registro de problemas encontrados durante a implementacao da Onda 2/Onda 3 e como foram resolvidos.

## 2026-04-29 - Immersion Plan demorando muito para carregar

### Sintomas

- A rota `/app/plan` ficava por muito tempo em `Loading experience...`.
- No DevTools, as requests de `weekly`, `history` e `learning-tracks` apareciam repetidas e demoradas.
- Lighthouse em ambiente de desenvolvimento marcou performance baixa, com TBT alto.
- Medicao direta antes da correcao indicou gargalo no backend:
  - `GET /learning-plan/weekly?week_offset=0`: aproximadamente 14s.
  - `GET /learning-plan/history`: aproximadamente 9s.

### Causa raiz

O repositorio SQLAlchemy carregava a lesson completa com `joinedload` em varias colecoes ao mesmo tempo:

- `phrases`
- `words`
- `grammar_points`
- `grammar_practice_items`
- `quiz.questions`

Isso gerava multiplicacao cartesiana de linhas no banco. Uma lesson com muitos itens em cada secao podia produzir milhares de linhas intermediarias para montar um unico objeto.

### Solucao aplicada

- Troca de `joinedload` por `selectinload` nos carregamentos completos de lesson.
- Criacao de `LessonSummary` para cenarios que precisam apenas de metadados.
- Inclusao de `LessonRepository.list_summaries()`.
- `get_weekly_plan()` e `get_lesson_history()` passaram a usar summaries em vez de carregar todo o conteudo das lessons.
- O frontend deixou de mostrar o spinner global quando ja existe `weeklyPlan.data` em cache.

### Arquivos principais

- `backend/domain/entities/learning.py`
- `backend/application/repositories/learning_repository.py`
- `backend/infrastructure/repositories/sqlalchemy_learning_repository.py`
- `backend/application/product/service.py`
- `frontend/src/features/product/components/ImmersionPlanPage.tsx`

### Validacao

Medicoes depois da correcao:

- `GET /learning-plan/weekly?week_offset=0`: `0.045s`
- `GET /learning-plan/history`: `0.006s`
- `GET /learning-tracks`: `0.004s`
- `GET /me`: `0.003s`
- `/app/plan` aquecido no Next dev server: `0.028s`

### Comparacao antes/depois

| Item | Antes do ajuste | Depois do ajuste |
| --- | --- | --- |
| Experiencia na UI | `/app/plan` ficava preso por muito tempo em `Loading experience...` | Tela carrega e fica interativa rapidamente |
| `GET /learning-plan/weekly?week_offset=0` medido via `curl` | Aproximadamente `14s` | `0.045s` |
| `GET /learning-plan/history` medido via `curl` | Aproximadamente `9s` | `0.006s` |
| `GET /learning-tracks` medido via `curl` | Ja era rapido, perto de poucos milissegundos | `0.004s` |
| `GET /me` medido via `curl` | Ja era rapido, perto de poucos milissegundos | `0.003s` |
| `/app/plan` no Next dev server aquecido | Carregamento visual lento por depender das APIs lentas | `0.028s` |
| DevTools depois do ajuste | N/A | `weekly`: `50ms` a `82ms`; `history`: `24ms` a `46ms`; `learning-tracks`: `15ms` a `29ms`; `/me`: `2ms` a `11ms`; rota do Next: `10ms` a `19ms` |

Resumo: o endpoint mais critico caiu de segundos para milissegundos. O problema principal nao estava no volume de requests do frontend, mas no custo de montar o roadmap/historico no backend.

Testes executados:

```bash
rtk .venv/bin/python -m pytest tests/test_product_service_fase2.py tests/test_product_features.py -q
```

Resultado: `19 passed`.

```bash
rtk npm test -- ProductFeaturePages.test.tsx productApi.test.ts useAuthSession.test.ts
```

Resultado: `21 passed`.

```bash
rtk npx tsc --noEmit
```

Resultado: sem erros TypeScript.

## 2026-04-29 - Lighthouse indicava performance baixa em desenvolvimento

### Sintomas

- Lighthouse marcou performance baixa na rota `/app/plan`.
- O proprio relatorio informou que extensoes do Chrome afetaram a medicao.
- O app estava rodando via `next dev`, que nao representa performance de producao.

### Causa raiz

A medicao foi feita em ambiente de desenvolvimento, com extensoes ativas e recompilacao/runtime do Next dev server. Isso aumenta artificialmente TBT e tempo de carregamento.

### Solucao aplicada

- Primeiro foi medida a API diretamente com `curl`, isolando backend de frontend.
- Depois foi medida a pagina ja aquecida no Next dev server.
- A recomendacao para futuras medicoes e usar aba anonima, sem extensoes, e preferencialmente build de producao.

### Comandos uteis

```bash
rtk curl -s -o /tmp/fluencyai-plan-page.html -w "%{http_code} %{time_total}\n" http://127.0.0.1:3000/app/plan
```

```bash
rtk curl -s -o /tmp/fluencyai-weekly.json -w "%{http_code} %{time_total}\n" http://127.0.0.1:8000/learning-plan/weekly?week_offset=0
```

Para endpoints autenticados, incluir:

```text
Authorization: Bearer <access_token>
```

## 2026-04-29 - Next dev com erro de chunk ausente

### Sintoma

Erro no Next:

```text
Error: Cannot find module './755.js'
Require stack:
- frontend/.next/server/webpack-runtime.js
```

### Causa provavel

Cache/build intermediario do Next inconsistente depois de alteracoes ou reinicio parcial do dev server.

### Solucao aplicada

- Parar backend e frontend.
- Subir os servicos novamente.
- Se o erro voltar, limpar o cache local do Next antes de reiniciar:

```bash
rtk rm -rf frontend/.next
rtk npm run dev -- --hostname 127.0.0.1 --port 3000
```

## 2026-04-29 - Login falhando no navegador normal, mas funcionando em guia anonima

### Sintomas

- A tela de login nao autenticava na janela normal do Chrome.
- DevTools mostrava requests falhando para `chrome-extension://invalid`.
- Em guia anonima o login funcionou.

### Causa provavel

Interferencia de extensao do navegador, cache de assets antigos ou estado invalido salvo no browser.

### Solucao aplicada

- Validar o fluxo em guia anonima.
- Recarregar a pagina limpando cache quando necessario.
- Confirmar que o backend respondia normalmente via login direto.
- Manter feedback visual de erro no formulario para casos de credenciais invalidas, token ausente ou falha de rede.

### Checklist se voltar a acontecer

1. Testar em guia anonima.
2. Limpar cache/local storage da origem `localhost:3000`.
3. Desabilitar extensoes que injetam scripts na pagina.
4. Conferir se `POST /login` retorna `200` no backend.
5. Conferir se o access token foi persistido no frontend.
