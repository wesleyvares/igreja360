import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, MessageCircle } from 'lucide-react';
import Modal from './Modal';
import { Celula, Visitante } from '../types';
import { abrirWhatsapp } from '../services/whatsapp';
import { getChurchCommunicationConfig } from '../services/churchCommunicationConfig';

type TemplateId = 'boasVindasCulto' | 'boasVindasCelula' | 'sentimosFalta' | 'conviteCulto' | 'conviteCelula';

type Props = {
  open: boolean;
  visitante: Visitante | null;
  celulas: Celula[];
  onClose: () => void;
};

export default function WhatsAppVisitanteModal({ open, visitante, celulas, onClose }: Props) {
  const [templateId, setTemplateId] = useState<TemplateId>('boasVindasCulto');
  const [mensagem, setMensagem] = useState('');
  const [copiado, setCopiado] = useState(false);

  const templates = useMemo(() => {
    if (!visitante) return {} as Record<TemplateId, string>;

    const config = getChurchCommunicationConfig();
    const primeiroNome = visitante.nome.trim().split(/\s+/)[0] || visitante.nome;
    const celulasAtivas = celulas
      .filter((c) => c.status === 'Ativa')
      .map((c) => `• ${c.nome}: ${c.diaSemana || 'dia a confirmar'} às ${c.horario || 'horário a confirmar'}${c.bairro ? ` - ${c.bairro}` : ''}`)
      .join('\n');

    const infoCultos = config.cultos?.trim() || 'Consulte nossa equipe para os próximos horários.';
    const infoCelulas = celulasAtivas || 'Temos células durante a semana. Posso te ajudar a encontrar a mais próxima.';
    const instagram = config.instagramUrl?.trim() ? `\n📲 Instagram: ${config.instagramUrl.trim()}` : '';
    const endereco = config.endereco?.trim() ? `\n📍 ${config.endereco.trim()}` : '';
    const assinatura = config.assinatura?.trim() || config.nomeIgreja;

    return {
      boasVindasCulto: `Olá, ${primeiroNome}! 💛 Foi uma alegria receber você na ${config.nomeIgreja}. Esperamos que tenha se sentido acolhido(a).\n\n⛪ Nossos cultos:\n${infoCultos}${endereco}${instagram}\n\nSe precisar de oração, informação ou quiser conhecer uma célula, pode falar com a gente por aqui. Aqui você é visto, cuidado e amado.\n\n${assinatura}`,
      boasVindasCelula: `Olá, ${primeiroNome}! 💛 Foi muito bom receber você em uma de nossas células. Queremos continuar caminhando perto de você.\n\n🏠 Células:\n${infoCelulas}\n\n⛪ Cultos:\n${infoCultos}${instagram}\n\nSe quiser, podemos te ajudar a encontrar a célula mais próxima ou o melhor horário para você.\n\n${assinatura}`,
      sentimosFalta: `Oi, ${primeiroNome}! 💛 Passando para dizer que sentimos sua falta e esperamos que esteja tudo bem com você. Não é cobrança, é carinho mesmo.\n\nQuando puder, será uma alegria receber você novamente na ${config.nomeIgreja}.\n\n⛪ Cultos:\n${infoCultos}\n\n🏠 Células:\n${infoCelulas}${instagram}\n\nSe precisar de oração ou de alguém para conversar, estamos por aqui.\n\n${assinatura}`,
      conviteCulto: `Oi, ${primeiroNome}! Tudo bem? 😊 Queremos te fazer um convite especial para estar conosco em um dos próximos cultos da ${config.nomeIgreja}.\n\n⛪ Horários:\n${infoCultos}${endereco}${instagram}\n\nVai ser muito bom te receber novamente. 💛\n\n${assinatura}`,
      conviteCelula: `Oi, ${primeiroNome}! 💛 Queremos te convidar para participar de uma célula da ${config.nomeIgreja}. É um ambiente mais próximo para comunhão, cuidado, oração e crescimento.\n\n🏠 Opções de células:\n${infoCelulas}\n\nSe me disser qual bairro e dia ficam melhores para você, posso te ajudar a escolher.\n\n${assinatura}`
    };
  }, [visitante, celulas, open]);

  useEffect(() => {
    if (!open || !visitante) return;
    setTemplateId('boasVindasCulto');
    setMensagem(templates.boasVindasCulto || '');
    setCopiado(false);
  }, [open, visitante, templates]);

  function selecionarTemplate(id: TemplateId) {
    setTemplateId(id);
    setMensagem(templates[id] || '');
    setCopiado(false);
  }

  async function copiar() {
    await navigator.clipboard.writeText(mensagem);
    setCopiado(true);
  }

  function enviar() {
    if (!visitante) return;
    try {
      abrirWhatsapp(visitante.telefone, mensagem);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Não foi possível abrir o WhatsApp.');
    }
  }

  if (!visitante) return null;

  return (
    <Modal
      title="Enviar mensagem pelo WhatsApp"
      subtitle={`${visitante.nome} • ${visitante.telefone || 'sem telefone'}`}
      open={open}
      onClose={onClose}
    >
      <div className="whatsapp-layout">
        <div className="whatsapp-templates">
          <strong>Escolha uma mensagem</strong>
          <button className={`template-card ${templateId === 'boasVindasCulto' ? 'selected' : ''}`} onClick={() => selecionarTemplate('boasVindasCulto')} type="button">
            <span>👋</span><div><b>Boas-vindas ao culto</b><small>Para quem visitou a igreja pela primeira vez.</small></div>
          </button>
          <button className={`template-card ${templateId === 'boasVindasCelula' ? 'selected' : ''}`} onClick={() => selecionarTemplate('boasVindasCelula')} type="button">
            <span>🏠</span><div><b>Boas-vindas à célula</b><small>Para quem participou de uma célula.</small></div>
          </button>
          <button className={`template-card ${templateId === 'sentimosFalta' ? 'selected' : ''}`} onClick={() => selecionarTemplate('sentimosFalta')} type="button">
            <span>💛</span><div><b>Sentimos sua falta</b><small>Contato cuidadoso com quem deixou de frequentar.</small></div>
          </button>
          <button className={`template-card ${templateId === 'conviteCulto' ? 'selected' : ''}`} onClick={() => selecionarTemplate('conviteCulto')} type="button">
            <span>⛪</span><div><b>Convite para culto</b><small>Convite simples com horários e Instagram.</small></div>
          </button>
          <button className={`template-card ${templateId === 'conviteCelula' ? 'selected' : ''}`} onClick={() => selecionarTemplate('conviteCelula')} type="button">
            <span>🤝</span><div><b>Convite para célula</b><small>Mostra automaticamente as células ativas.</small></div>
          </button>
        </div>

        <div className="whatsapp-editor">
          <div className="whatsapp-editor-header">
            <div>
              <strong>Pré-visualização</strong>
              <span>Você pode editar o texto antes de enviar.</span>
            </div>
            <MessageCircle size={22} />
          </div>
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={16} />
          <div className="whatsapp-note">
            O sistema não envia a mensagem sozinho. Ele abre a conversa no WhatsApp e você confirma o envio.
          </div>
          <div className="modal-actions-right">
            <button className="btn btn-soft" type="button" onClick={copiar}><Copy size={16} /> {copiado ? 'Copiado' : 'Copiar'}</button>
            <button className="btn btn-whatsapp" type="button" onClick={enviar} disabled={!visitante.telefone || !mensagem.trim()}><ExternalLink size={16} /> Abrir no WhatsApp</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
