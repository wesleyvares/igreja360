import { useMemo, useState } from 'react';
import { MessageCircle, UsersRound } from 'lucide-react';
import Modal from './Modal';
import { Celula, Evento, Membro, Visitante } from '../types';
import { contatosDoEvento, mensagemEvento } from '../services/communication';
import { abrirWhatsapp, compartilharNoWhatsapp } from '../services/whatsapp';

type Props = {
  evento: Evento | null;
  membros: Membro[];
  visitantes: Visitante[];
  celulas: Celula[];
  open: boolean;
  onClose: () => void;
};

export default function EventoComunicacaoModal({ evento, membros, visitantes, celulas, open, onClose }: Props) {
  const [busca, setBusca] = useState('');

  const contatos = useMemo(() => {
    if (!evento) return [];
    const lista = contatosDoEvento(evento, membros, visitantes, celulas);
    const q = busca.toLowerCase().trim();
    if (!q) return lista;
    return lista.filter((c) => c.nome.toLowerCase().includes(q) || c.telefone.includes(q));
  }, [evento, membros, visitantes, celulas, busca]);

  if (!evento) return null;

  return (
    <Modal title="Comunicar evento" subtitle={`${evento.titulo} • Público: ${evento.publico}`} open={open} onClose={onClose}>
      <div className="event-communication-actions">
        <button className="btn btn-whatsapp" type="button" onClick={() => compartilharNoWhatsapp(mensagemEvento(evento, 'convite'))}>
          <UsersRound size={16} /> Enviar para grupo / lista
        </button>
        <span>O WhatsApp abrirá a seleção de conversa ou grupo com a mensagem pronta.</span>
      </div>

      <div className="panel inline-panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Envio individual</h3><span>{contatos.length} contato(s) compatíveis com o público do evento</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar contato" />
        </div>
        <div className="recipient-list">
          {contatos.map((contato) => (
            <div className="recipient-row" key={`${contato.origem}-${contato.id}`}>
              <div><strong>{contato.nome}</strong><span>{contato.origem} • {contato.telefone}</span></div>
              <div className="actions">
                <button className="btn btn-soft" type="button" onClick={() => abrirWhatsapp(contato.telefone, mensagemEvento(evento, 'convite', contato.nome))}><MessageCircle size={15} /> Convite</button>
                <button className="btn btn-warning" type="button" onClick={() => abrirWhatsapp(contato.telefone, mensagemEvento(evento, 'reforco', contato.nome))}>Reforço</button>
              </div>
            </div>
          ))}
          {!contatos.length && <div className="empty">Nenhum contato encontrado para este público.</div>}
        </div>
      </div>
    </Modal>
  );
}
