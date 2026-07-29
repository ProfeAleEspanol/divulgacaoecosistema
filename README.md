# Ecossistema INEMA

Página institucional e comercial para concentrar as frentes do Ecossistema INEMA e apresentar a proposta para empresas.

## Onde alterar conteúdo

- Textos, contatos, links, CTAs e perguntas frequentes: `src/data/site-content.ts`
- URL pública para metadados sociais: configure `NEXT_PUBLIC_SITE_URL`
- Integração real do formulário, se houver CRM/webhook/API: configure `NEXT_PUBLIC_INTEREST_API_URL`
- Imagem principal: `public/images/imersivo-presencial-provisorio.png`
- Favicon provisório: `public/brand/favicon-inema-placeholder.svg`

## Contato

O contato comercial principal está configurado para a Tiza:

- WhatsApp: `+55 54 99642-2265`
- E-mail: `inematds@gmail.com`

Sem `NEXT_PUBLIC_INTEREST_API_URL`, o formulário abre o WhatsApp com os dados preenchidos para envio manual. Com a variável configurada, ele envia um `POST` com JSON para a API informada.

## Publicação

O repositório publica automaticamente no GitHub Pages a cada push no branch `main`.

URL esperada:

```text
https://profealeespanol.github.io/divulgacaoecosistema/
```

## Comandos

```bash
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```
