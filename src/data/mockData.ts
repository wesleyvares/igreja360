import { Aviso, Celula, Evento, LancamentoFinanceiro, Membro, Visitante } from '../types';

export const demoIgrejaId = 'igreja-demo';

export const membrosMock: Membro[] = [
  {
    id: 'm1', igrejaId: demoIgrejaId, nome: 'Ana Cristina', telefone: '(27) 99999-1001', email: 'ana@email.com',
    tipo: 'Liderança', status: 'Ativo', ministerio: 'Intercessão', celulaId: 'c1', dataNascimento: '1988-05-12',
    endereco: 'Praia do Morro, Guarapari-ES', observacoes: 'Líder de intercessão.', ativo: true
  },
  {
    id: 'm2', igrejaId: demoIgrejaId, nome: 'Marcos Paulo', telefone: '(27) 99999-1002', email: 'marcos@email.com',
    tipo: 'Membro', status: 'Ativo', ministerio: 'Mídia', celulaId: 'c2', dataNascimento: '1992-09-03',
    endereco: 'Centro, Guarapari-ES', observacoes: 'Equipe de transmissão.', ativo: true
  },
  {
    id: 'm3', igrejaId: demoIgrejaId, nome: 'Juliana Santos', telefone: '(27) 99999-1003', email: 'juliana@email.com',
    tipo: 'Membro', status: 'Acompanhar', ministerio: 'Recepção', celulaId: 'c1', dataNascimento: '1995-11-18',
    endereco: 'Muquiçaba, Guarapari-ES', observacoes: 'Precisa atualizar cadastro.', ativo: true
  }
];

export const visitantesMock: Visitante[] = [
  {
    id: 'v1', igrejaId: demoIgrejaId, nome: 'Rafael Lima', telefone: '(27) 99999-2001', dataVisita: '2026-06-14',
    bairro: 'Praia do Morro', cidade: 'Guarapari', dataNascimento: '1990-02-14', faixaEtaria: '30-39',
    estadoCivil: 'Casado(a)', comoConheceu: 'Convite de amigo/familiar', membroOutraIgreja: 'Não', nomeOutraIgreja: '',
    status: 'Novo', responsavel: 'Equipe Recepção', observacoes: 'Retornar durante a semana.', ativo: true
  },
  {
    id: 'v2', igrejaId: demoIgrejaId, nome: 'Patrícia Rocha', telefone: '(27) 99999-2002', dataVisita: '2026-06-07',
    bairro: 'Centro', cidade: 'Guarapari', dataNascimento: '1984-08-21', faixaEtaria: '40-49',
    estadoCivil: 'Solteiro(a)', comoConheceu: 'Instagram', membroOutraIgreja: 'Sim', nomeOutraIgreja: 'Igreja Exemplo',
    status: 'Em acompanhamento', responsavel: 'Ana Cristina', observacoes: 'Interessada em célula.', ativo: true
  }
];

export const celulasMock: Celula[] = [
  {
    id: 'c1', igrejaId: demoIgrejaId, nome: 'Casa de Paz - Praia do Morro', lider: 'Ana Cristina',
    cep: '29216-000', logradouro: 'Av. Praiana', numero: '100', complemento: 'Apto 201',
    bairro: 'Praia do Morro', cidade: 'Guarapari', estado: 'ES', diaSemana: 'Quarta-feira', horario: '19:30',
    status: 'Ativa', ativo: true
  },
  {
    id: 'c2', igrejaId: demoIgrejaId, nome: 'Célula Jovens', lider: 'Marcos Paulo',
    cep: '29200-000', logradouro: 'Rua Joaquim da Silva Lima', numero: '50', complemento: '',
    bairro: 'Centro', cidade: 'Guarapari', estado: 'ES', diaSemana: 'Sábado', horario: '18:00',
    status: 'Ativa', ativo: true
  }
];

export const financeiroMock: LancamentoFinanceiro[] = [
  { id: 'f1', igrejaId: demoIgrejaId, data: '2026-06-01', tipo: 'Entrada', categoria: 'Dízimos', descricao: 'Dízimos do culto de domingo', valor: 3250, formaPagamento: 'PIX', responsavel: 'Tesouraria', ativo: true },
  { id: 'f2', igrejaId: demoIgrejaId, data: '2026-06-02', tipo: 'Entrada', categoria: 'Ofertas', descricao: 'Ofertas gerais', valor: 1180, formaPagamento: 'Dinheiro/PIX', responsavel: 'Tesouraria', ativo: true },
  { id: 'f3', igrejaId: demoIgrejaId, data: '2026-06-05', tipo: 'Saída', categoria: 'Aluguel', descricao: 'Aluguel do espaço', valor: 2400, formaPagamento: 'Transferência', responsavel: 'Administração', ativo: true }
];

export const eventosMock: Evento[] = [
  { id: 'e1', igrejaId: demoIgrejaId, titulo: 'Culto de Celebração', data: '2026-10-04', horario: '19:00', local: 'Templo principal', publico: 'Todos', status: 'Aberto', descricao: 'Culto semanal com louvor e palavra.', enviarAoSalvar: false, ativo: true },
  { id: 'e2', igrejaId: demoIgrejaId, titulo: 'Encontro de Mulheres', data: '2026-10-08', horario: '19:30', local: 'Templo principal', publico: 'Membros', status: 'Planejado', descricao: 'Noite especial de comunhão.', enviarAoSalvar: false, ativo: true }
];

export const avisosMock: Aviso[] = [
  {
    id: 'a1', igrejaId: demoIgrejaId, titulo: 'Escala de mídia', publico: 'Equipe de mídia',
    dataPublicacao: '2026-09-20', validadeAte: '2026-10-05', status: 'Publicado',
    mensagem: 'Chegar 1 hora antes para testes de som, câmeras e transmissão.', ativo: true
  },
  {
    id: 'a2', igrejaId: demoIgrejaId, titulo: 'Atualização cadastral', publico: 'Todos',
    dataPublicacao: '2026-09-23', validadeAte: '2026-10-10', status: 'Publicado',
    mensagem: 'Atualize telefone, endereço, célula e ministério com a secretaria.', ativo: true
  }
];
