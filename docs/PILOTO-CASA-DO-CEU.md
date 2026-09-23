# Piloto Casa do Céu v0.1

Escopo liberado para dados reais:
- Visitantes
- Células
- Relatório de célula
- Autenticação Google e e-mail/senha

Os demais módulos permanecem visíveis conforme o perfil, mas exibem:
"Em breve em produção, aguarde novidades! Deus te abençoe 🙏❤️‍🔥!"

## Bloqueadores antes de dados reais
- [ ] package-lock.json versionado
- [ ] dependências fixadas (sem "latest")
- [ ] Firebase definitivo confirmado
- [ ] Authentication: Google habilitado
- [ ] Authentication: Email/Password habilitado
- [ ] usuário administrador criado em Authentication e /usuarios
- [ ] Firestore Rules publicadas
- [ ] Storage Rules publicadas
- [ ] variáveis VITE_FIREBASE_* configuradas no ambiente de deploy
- [ ] build e lint aprovados
- [ ] testes de isolamento por igreja e célula aprovados
- [ ] estratégia de backup/exportação habilitada antes do uso real

## Política de dados
O piloto deve usar o projeto Firebase definitivo. A futura troca para domínio próprio não deve criar outro Firestore. O domínio será conectado ao mesmo Hosting/projeto, preservando os dados.
