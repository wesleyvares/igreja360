# Igreja 360 - React + Firebase

Projeto criado a partir da ideia do HTML enviado, porém convertido para uma estrutura React/Vite com TypeScript, rotas, páginas separadas, Firebase preparado e regras de segurança.

## O que já vem pronto

- Login com Firebase Authentication, sem senha fixa no HTML.
- Modo demonstração local quando o Firebase ainda não estiver configurado.
- Dashboard com indicadores e gráficos.
- Membros.
- Visitantes.
- Células.
- Financeiro.
- Eventos.
- Relatórios.
- Avisos.
- Rádio online.
- Configurações.
- Exportação CSV compatível com Excel.
- Firestore Rules com perfis e separação por igreja.
- Firebase Hosting preparado.

## Como rodar no computador

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:5173
```

## Como configurar o Firebase

1. Crie um projeto no Firebase.
2. Ative Authentication com e-mail e senha.
3. Ative Cloud Firestore.
4. Copie `.env.example` para `.env.local`.
5. Preencha as variáveis do Firebase.
6. Crie um usuário no Authentication.
7. Crie um documento em `/usuarios/{uid}` no Firestore.

## Segurança

A proteção real fica em Firebase Authentication, documento de usuário com perfil e igrejaId, Firestore Rules, separação por igreja e auditoria.

## Estrutura

```text
src
├── components
├── contexts
├── data
├── firebase
├── layouts
├── pages
├── routes
├── services
├── styles
├── types
└── utils
```
