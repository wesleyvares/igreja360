import { CalendarDays, Megaphone } from 'lucide-react';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { avisosVigentes } from '../services/communication';
import { dataBR } from '../utils/format';

function publicoPermitido(publico: string, perfil: string | undefined) {
  const alvo = (publico || 'Todos').toLowerCase();
  if (alvo === 'todos') return true;
  if (perfil === 'pastor' || perfil === 'admin' || perfil === 'secretaria' || perfil === 'midia') return true;
  if (perfil === 'visitante') return alvo.includes('visitante');
  if (perfil === 'membro') return alvo.includes('membro') || alvo.includes('liderança') || alvo.includes('lideranca');
  if (perfil === 'lider') return alvo.includes('membro') || alvo.includes('lider') || alvo.includes('célula') || alvo.includes('celula');
  if (perfil === 'tesoureiro') return alvo.includes('membro');
  return false;
}

export default function QuadroAvisosPage() {
  const { user } = useAuth();
  const { avisos, eventos } = useChurchData();
  const hoje = new Date().toISOString().slice(0, 10);

  const comunicados = avisosVigentes(avisos).filter((a) => publicoPermitido(a.publico, user?.perfil));
  const proximosEventos = eventos
    .filter((e) => e.status !== 'Cancelado' && e.status !== 'Realizado' && e.data >= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 8);

  return (
    <>
      <PageHeader title="Quadro de avisos" subtitle="Mensagens vigentes e próximos eventos da Igreja 360." />

      <div className="bulletin-grid">
        <section className="panel">
          <div className="panel-header">
            <div className="panel-title"><h3><Megaphone size={18} /> Avisos atuais</h3><span>{comunicados.length} mensagem(ns) dentro do prazo</span></div>
          </div>
          <div className="bulletin-list">
            {comunicados.map((aviso) => (
              <article className="bulletin-card" key={aviso.id}>
                <div className="bulletin-card-top"><Badge color="blue">{aviso.publico}</Badge><span>até {dataBR(aviso.validadeAte)}</span></div>
                <h3>{aviso.titulo}</h3>
                <p>{aviso.mensagem}</p>
              </article>
            ))}
            {!comunicados.length && <div className="empty">Nenhum aviso vigente para o seu perfil.</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div className="panel-title"><h3><CalendarDays size={18} /> Próximos eventos</h3><span>Agenda publicada no sistema</span></div>
          </div>
          <div className="bulletin-list">
            {proximosEventos.map((evento) => (
              <article className="bulletin-card event" key={evento.id}>
                <div className="bulletin-card-top"><Badge color="purple">{evento.publico || 'Todos'}</Badge><span>{dataBR(evento.data)} {evento.horario ? `• ${evento.horario}` : ''}</span></div>
                <h3>{evento.titulo}</h3>
                <p>{evento.descricao || 'Evento da igreja.'}</p>
                {evento.local && <small>📍 {evento.local}</small>}
              </article>
            ))}
            {!proximosEventos.length && <div className="empty">Nenhum evento futuro cadastrado.</div>}
          </div>
        </section>
      </div>
    </>
  );
}
