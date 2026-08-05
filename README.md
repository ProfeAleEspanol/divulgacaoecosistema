# INEMA.AI MAP

MVP funcional para empresários diagnosticarem gargalos do negócio e receberem um Mapa de Oportunidades de Inteligência Artificial com automações, agentes recomendados, prompts, impacto, esforço, horas estimadas e plano de implementação para 7, 30 e 90 dias.

## Stack

- Next.js 15 com App Router
- TypeScript
- Tailwind CSS
- Persistência local via `localStorage`
- Testes da lógica central com `node:test` e `tsc`
- Rota server-side opcional para resumo com OpenAI

## Executar localmente

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Comandos de qualidade:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## O que está funcional

- Página inicial completa com proposta, demonstração visual do mapa, como funciona, segmentos, benefícios, depoimentos placeholder, planos, FAQ e CTA final.
- Diagnóstico interativo em 10 etapas com validação, progresso, voltar, opções rápidas, campos abertos e salvamento temporário.
- Demonstração pré-preenchida de uma clínica.
- Tela de processamento com mensagens dinâmicas.
- Dashboard com maturidade em IA, resumo executivo, gargalos, oportunidades, horas potenciais, áreas prioritárias, matriz impacto versus esforço e filtros.
- Detalhe de oportunidade em modal com diagnóstico, implementação, ferramentas, riscos, indicadores, prompt e CTA.
- Captura opcional de nome e e-mail antes de liberar o relatório completo.
- Botões para copiar resumo, compartilhar e imprimir/salvar como PDF pelo navegador.
- Modal de interesse para planos e implementação.
- Funcionamento integral sem chave de IA.
- Histórico local com mapas anteriores, retomada e exportação JSON.
- Admin local para workspace, auth-ready, integrações e oportunidades customizadas.
- Editor de catálogo que adiciona novos casos ao motor de recomendação dos próximos diagnósticos.

## Arquitetura

```text
app/
  api/ai-summary/route.ts        rota server-side opcional para IA
  globals.css                    estilos globais, acessibilidade e impressão
  layout.tsx                     metadados SEO
  page.tsx                       entrypoint da aplicação
src/
  components/InemaAiMapApp.tsx   experiência completa do MVP
  data/demo-diagnosis.ts         diagnóstico de demonstração da clínica
  data/opportunities.ts          catálogo modular de oportunidades
  lib/analytics.ts               eventos abstratos sem envio externo
  lib/local-diagnostic-store.ts  persistência local substituível por backend
  lib/recommendation-engine.ts   motor de regras e pontuação
  types/inema-map.ts             modelos do diagnóstico, mapa e oportunidade
tests/
  recommendation-engine.test.ts  testes da lógica central
```

## V2 local-first

A versão atual já inclui uma camada inicial para evolução do produto:

- Histórico: botão `Histórico` no cabeçalho lista os mapas gerados neste navegador.
- Exportação: cada relatório e item do histórico pode ser exportado em JSON.
- Admin: botão `Admin` abre configurações de workspace, integrações e catálogo.
- Auth-ready: o workspace salva responsável, e-mail e modo `local` ou `supabase-ready`.
- Integrações: campos para CRM, WhatsApp e webhook ficam salvos localmente.
- Catálogo customizado: novas oportunidades criadas no admin entram no motor de regras nos próximos diagnósticos.

Essas informações continuam no `localStorage`. Para migrar para Supabase, substitua a implementação em `src/lib/local-diagnostic-store.ts` por chamadas autenticadas e preserve os modelos em `src/types/inema-map.ts`.

## Lógica de recomendação

O motor local cruza:

- problemas relatados e palavras-chave;
- áreas que mais consomem tempo;
- segmento;
- objetivo de 90 dias;
- prioridade declarada;
- impacto potencial;
- esforço de implementação;
- urgência;
- horas semanais em tarefas repetitivas.

Cada oportunidade recebe uma pontuação explicável de 0 a 100. O catálogo fica em `src/data/opportunities.ts`, separado da interface, para permitir novos segmentos e casos de uso sem reescrever o dashboard.

## Personalizar o catálogo

Edite `src/data/opportunities.ts` e adicione novos itens com:

- `triggerKeywords`
- `relevantAreas`
- `relevantSegments`
- `relevantGoals`
- `relevantPriorities`
- `baseImpact`
- `effort`
- `urgency`
- `prompt`
- `implementationSteps`
- `risks`
- `metrics`

Depois rode:

```bash
npm run test
npm run typecheck
```

## IA generativa opcional

A aplicação não precisa de chave para funcionar. Sem `OPENAI_API_KEY`, a rota `/api/ai-summary` retorna o resumo local baseado em regras.

Para ativar personalização server-side:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5
```

Nunca coloque chaves no frontend. Use `.env.local` para desenvolvimento e variáveis seguras no ambiente de produção.

## Publicação

O build padrão gera exportação estática e prepara a pasta `dist`, compatível com ambientes que esperam arquivos estáticos:

```bash
npm run build
```

Nesse modo, a rota `/api/ai-summary` não é usada no navegador exportado; o app mantém o fallback local de regras.

Para um deploy server-rendered com a rota de IA ativa em produção, configure:

```env
SERVER_BUILD=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5
```

O admin local já reserva estas variáveis para uma V3 com backend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
INEMA_IMPLEMENTATION_WEBHOOK_URL=
```

## Dados e privacidade

No MVP, respostas, relatório e lead opcional ficam no navegador via `localStorage`. A camada `src/lib/local-diagnostic-store.ts` foi isolada para futura troca por Supabase, autenticação ou outro backend.

Eventos de analytics são disparados como `CustomEvent` no navegador e não enviam dados para serviços externos.
