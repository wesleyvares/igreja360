import { Aviso, Celula, Evento, Membro, Visitante } from '../types';
import { dataBR } from '../utils/format';
import { getChurchCommunicationConfig } from './churchCommunicationConfig';

export function avisoEstaVigente(aviso: Aviso, hoje = new Date()) {
  if (aviso.status !== 'Publicado' || aviso.ativo === false) return false;
  const hojeIso = hoje.toISOString().slice(0, 10);
  const inicio = aviso.dataPublicacao || '';
  const fim = aviso.validadeAte || '9999-12-31';
  return (!inicio || inicio <= hojeIso) && fim >= hojeIso;
}

export function avisosVigentes(avisos: Aviso[]) {
  return avisos.filter((aviso) => avisoEstaVigente(aviso));
}

export function mensagemAvisosVigentes(nome: string, avisos: Aviso[]) {
  const config = getChurchCommunicationConfig();
  const primeiroNome = nome.trim().split(/\s+/)[0] || nome;
  const vigentes = avisosVigentes(avisos);
  if (!vigentes.length) return '';

  const lista = vigentes
    .map((a) => `📌 *${a.titulo}*\n${a.mensagem}${a.validadeAte ? `\nVálido até ${dataBR(a.validadeAte)}` : ''}`)
    .join('\n\n');

  return `Olá, ${primeiroNome}! 💛 Temos alguns avisos importantes da ${config.nomeIgreja}:\n\n${lista}\n\n${config.assinatura || config.nomeIgreja}`;
}

export function mensagemEvento(evento: Evento, tipo: 'convite' | 'reforco' = 'convite', nome?: string) {
  const config = getChurchCommunicationConfig();
  const saudacao = nome ? `Olá, ${nome.trim().split(/\s+/)[0]}! ` : '';
  const abertura = tipo === 'convite'
    ? 'Queremos te fazer um convite especial.'
    : 'Passando para reforçar nosso convite.';

  return `${saudacao}${abertura} 💛\n\n📅 *${evento.titulo}*\n🗓️ ${dataBR(evento.data)}${evento.horario ? ` às ${evento.horario}` : ''}${evento.local ? `\n📍 ${evento.local}` : ''}${evento.descricao ? `\n\n${evento.descricao}` : ''}\n\nEsperamos você!\n\n${config.assinatura || config.nomeIgreja}`;
}

export type ContatoEvento = {
  id: string;
  nome: string;
  telefone: string;
  origem: 'Membro' | 'Visitante';
};

export function contatosDoEvento(evento: Evento, membros: Membro[], visitantes: Visitante[], celulas: Celula[]): ContatoEvento[] {
  const publico = (evento.publico || 'Todos').trim();
  const normalizado = publico.toLowerCase();

  if (normalizado === 'visitantes') {
    return visitantes.filter((v) => v.telefone).map((v) => ({ id: v.id, nome: v.nome, telefone: v.telefone, origem: 'Visitante' as const }));
  }

  if (normalizado === 'membros') {
    return membros.filter((m) => m.telefone && m.status !== 'Inativo').map((m) => ({ id: m.id, nome: m.nome, telefone: m.telefone, origem: 'Membro' as const }));
  }

  if (normalizado === 'liderança' || normalizado === 'lideranca') {
    return membros.filter((m) => m.telefone && m.tipo === 'Liderança' && m.status !== 'Inativo').map((m) => ({ id: m.id, nome: m.nome, telefone: m.telefone, origem: 'Membro' as const }));
  }

  if (normalizado.startsWith('ministério:') || normalizado.startsWith('ministerio:')) {
    const alvo = publico.split(':').slice(1).join(':').trim().toLowerCase();
    return membros
      .filter((m) => m.telefone && m.status !== 'Inativo' && (m.ministerio || '').toLowerCase() === alvo)
      .map((m) => ({ id: m.id, nome: m.nome, telefone: m.telefone, origem: 'Membro' as const }));
  }

  if (normalizado.startsWith('célula:') || normalizado.startsWith('celula:')) {
    const alvo = publico.split(':').slice(1).join(':').trim().toLowerCase();
    const celula = celulas.find((c) => c.nome.toLowerCase() === alvo);
    if (!celula) return [];
    return membros
      .filter((m) => m.telefone && m.status !== 'Inativo' && m.celulaId === celula.id)
      .map((m) => ({ id: m.id, nome: m.nome, telefone: m.telefone, origem: 'Membro' as const }));
  }

  const lista: ContatoEvento[] = [
    ...membros.filter((m) => m.telefone && m.status !== 'Inativo').map((m) => ({ id: m.id, nome: m.nome, telefone: m.telefone, origem: 'Membro' as const })),
    ...visitantes.filter((v) => v.telefone).map((v) => ({ id: v.id, nome: v.nome, telefone: v.telefone, origem: 'Visitante' as const }))
  ];
  return lista;
}
