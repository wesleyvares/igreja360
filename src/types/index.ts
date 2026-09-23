export type PerfilUsuario = 'pastor' | 'admin' | 'secretaria' | 'tesoureiro' | 'lider' | 'midia' | 'membro' | 'visitante';

export type AppUser = {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  igrejaId: string;
  ativo: boolean;
};

export type BaseEntity = {
  id: string;
  igrejaId: string;
  criadoEm?: string;
  criadoPor?: string;
  atualizadoEm?: string;
  atualizadoPor?: string;
  ativo?: boolean;
};

export type Membro = BaseEntity & {
  nome: string;
  telefone: string;
  email: string;
  tipo: 'Membro' | 'Visitante integrado' | 'Liderança';
  status: 'Ativo' | 'Acompanhar' | 'Inativo';
  ministerio: string;
  celulaId: string;
  dataNascimento: string;
  endereco: string;
  observacoes: string;
};

export type Visitante = BaseEntity & {
  nome: string;
  telefone: string;
  origem: string;
  primeiraVisita: string;
  status: 'Novo' | 'Em acompanhamento' | 'Integrado' | 'Sem retorno';
  responsavel: string;
  observacoes: string;
};

export type Celula = BaseEntity & {
  nome: string;
  lider: string;
  bairro: string;
  diaSemana: string;
  horario: string;
  membros: number;
  status: 'Ativa' | 'Pausada' | 'Em implantação';
};

export type LancamentoFinanceiro = BaseEntity & {
  data: string;
  tipo: 'Entrada' | 'Saída';
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: string;
  responsavel: string;
};

export type Evento = BaseEntity & {
  titulo: string;
  data: string;
  horario: string;
  local: string;
  publico: string;
  status: 'Planejado' | 'Aberto' | 'Realizado' | 'Cancelado';
  descricao: string;
};

export type Aviso = BaseEntity & {
  titulo: string;
  publico: string;
  dataPublicacao: string;
  status: 'Rascunho' | 'Publicado';
  mensagem: string;
};

export type CollectionName = 'membros' | 'visitantes' | 'celulas' | 'financeiro' | 'eventos' | 'avisos';

export type EntityMap = {
  membros: Membro;
  visitantes: Visitante;
  celulas: Celula;
  financeiro: LancamentoFinanceiro;
  eventos: Evento;
  avisos: Aviso;
};
