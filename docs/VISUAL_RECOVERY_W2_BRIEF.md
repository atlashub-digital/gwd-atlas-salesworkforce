# GWD Visual Recovery — WAVE 2 Brief (/entrar + auth UX) — Diana → Claude Code

Pré-requisito: Wave 1 feito (tokens, componentes em apps/web/components, homepage golden). Reusa os componentes/tokens existentes.

## 1. /entrar (apps/web/app/entrar/page.tsx) — conversão premium
Target (Drive 03_entrar_desktop/04_mobile) — implementar:
- Página full-bleed escura: foto da Maia à direita (media maia-workspace-v02, borda arredondada no lado esquerdo ou full-bleed com gradiente navy da esquerda), com anotação manuscrita decorativa na imagem: "Aprende. Conecta. Divulga. Cresce." (apenas decorativa, aria-hidden).
- Esquerda: H1 "Dá o primeiro passo na GWD." + subcopy "Junta-te a uma comunidade global de pessoas que aprendem, divulgam, vendem e crescem no mercado digital." + 4 itens com ícones: Formação prática / Comunidade ativa / Ferramentas e suporte / Oportunidades na Europa e no Brasil.
- CARD central claro (tabs): "Criar conta" | "Já tem conta". Campos: Nome completo, Email, País (select BR/EU/OUTRO), **WhatsApp App** (prefixo + indicativo, ex. +55 / +351), checkbox "Li e aceito os Termos e Condições e a Política de Privacidade", CTA "Quero fazer parte →".
- Card depoimento (canto): ""A GWD ajudou-me a transformar o meu interesse em oportunidades reais de aprendizagem, criação e performance." — Maia, Comunidade GWD" com avatar pequeno da Maia.
- Legal truth preservado: consent explícito; nunca prometer emprego/rendimento.
- Mobile (target 04): form curto, thumb-friendly (targets 44px+), foto da Maia como topo/hero pequeno.

## 2. FORM + auth (funcional, sem quebrar E2E)
- O form submete o lead como hoje (POST /v1/leads com consent; phone extra: enviar no utm/notes? — NÃO alterar o contrato da API; guardar o WhatsApp apenas visualmente no form por agora, com nota: campo phone pendente de suporte na API — NÃO quebrar o POST existente; se o contrato não aceitar phone, enviar sem o campo e manter o input desactivado com tooltip "Em breve", OU enviar dentro de utm? NÃO — nunca falsificar dados; deixa o campo VISUAL desactivado com badge "EM BREVE" até a API aceitar phone. Documenta no fim.)
- Fluxo pós-registo: mantém o heading "O próximo passo é teu." + link "Continuar para a plataforma" (E2E depende EXACTAMENTE destes textos — não mudar).
- Botão "Continuar com Google" na tela de login/código da APP? NÃO — essa tela pertence a apps/app (W4). Em apps/web /entrar apenas o link "Já tenho conta".
- CI: os textos/labels usados por tests/browser/verify.cjs não podem mudar: "Como te chamas?", "Email", "O teu mercado", checkbox, "Registar interesse", "O próximo passo é teu.", "Continuar para a plataforma". O form pode ter novo visual; labels/aria e nomes de botões mantêm-se.

## 3. NÃO TOCAR
apps/api, apps/worker, packages/db, contracts, domain. Nada de backend/contratos.

## 4. ENTREGA
Código no working tree (sem commit). Build: npx pnpm@10.28.0 --filter @gwd/web build a passar. Reporta ficheiros alterados + resultado.
