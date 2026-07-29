# Imersivos INEMA

Página institucional e comercial dos Imersivos Presenciais do Ecossistema INEMA.

## Onde alterar conteúdo

- Datas, valores, vagas, contatos, links e status das inscrições: `src/data/site-content.ts`
- Integração real do formulário: configure `NEXT_PUBLIC_INTEREST_API_URL`
- URL pública para metadados sociais: configure `NEXT_PUBLIC_SITE_URL`
- Imagem provisória do hero: `public/images/imersivo-presencial-provisorio.png`
- Favicon provisório: `public/brand/favicon-inema-placeholder.svg`

## Formulário

Sem `NEXT_PUBLIC_INTEREST_API_URL`, o formulário funciona em modo demonstração e salva os dados no `localStorage` do navegador. Com a variável configurada, ele envia um `POST` com JSON para a API informada.

## Comandos

```bash
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```
