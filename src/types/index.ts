export type PerfilUsuario = 'pastor' | 'admin' | 'secretaria' | 'tesoureiro' | 'lider' | 'midia' | 'membro' | 'visitante';

export type AppUser = {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  igrejaId: string;
  celulaId?: string;
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
  dataVisita: string;
  primeiraVisita?: string;
  bairro: string;
  cidade: string;
  dataNascimento: string;
  faixaEtaria: string;
  estadoCivil: string;
  comoConheceu: string;
  origem?: string;
  membroOutraIgreja: 'Sim' | 'Não';
  nomeOutraIgreja: string;
  status: 'Novo' | 'Em acompanhamento' | 'Integrado' | 'Sem retorno';
  responsavel: string;
  observacoes: string;
};

export type Celula = BaseEntity & {
  nome: string;
  lider: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  diaSemana: string;
  horario: string;
  membros?: number;
  status: 'Ativa' | 'Pausada' | 'Em implantação';
};

export type RelatorioCelulaPresenca = {
  membroId: string;
  nome: string;
  presente: boolean;
};

export type RelatorioCelulaVisitante = {
  nome: string;
  telefone: string;
};

export type RelatorioCelula = BaseEntity & {
  celulaId: string;
  celulaNome: string;
  liderId: string;
  liderNome: string;
  dataReuniao: string;
  presencas: RelatorioCelulaPresenca[];
  visitantes: RelatorioCelulaVisitante[];

  quemTocouLouvor: string;
  quemConduziuLouvores: string;
  louvoresMinistrados: string;
  quemMinistrouQuebraGelo: string;
  quemMinistrouPalavra: string;
  quemMinistrouCadeiraVazia: string;

  houvePedidoOracao: boolean;
  pedidoOracaoDescricao: string;
  houveTestemunho: boolean;
  testemunhoDescricao: string;

  preenchidoPorId: string;
  preenchidoPorNome: string;
  nivelParticipacao: 1 | 2 | 3 | 4 | 5;
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
  enviarAoSalvar?: boolean;
};

export type Aviso = BaseEntity & {
  titulo: string;
  publico: string;
  dataPublicacao: string;
  validadeAte: string;
  status: 'Rascunho' | 'Publicado';
  mensagem: string;
};

export type CollectionName = 'membros' | 'visitantes' | 'celulas' | 'relatoriosCelula' | 'financeiro' | 'eventos' | 'avisos';

export type EntityMap = {
  membros: Membro;
  visitantes: Visitante;
  celulas: Celula;
  relatoriosCelula: RelatorioCelula;
  financeiro: LancamentoFinanceiro;
  eventos: Evento;
  avisos: Aviso;
};
