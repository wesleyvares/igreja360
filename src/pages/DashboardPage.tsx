import ChartBox from '../components/ChartBox';
import KpiCard from '../components/KpiCard';
import PageHeader from '../components/PageHeader';
import { useChurchData } from '../contexts/ChurchDataContext';
import { moedaBR } from '../utils/format';

export default function DashboardPage() {
  const { membros, visitantes, celulas, financeiro, eventos } = useChurchData();
  const entradas = financeiro.filter((x) => x.tipo === 'Entrada').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const saidas = financeiro.filter((x) => x.tipo === 'Saída').reduce((sum, item) => sum + Number(item.valor || 0), 0);
  const saldo = entradas - saidas;
  const visitantesPendentes = visitantes.filter((v) => v.status !== 'Integrado').length;
  const membrosAtivos = membros.filter((m) => m.status === 'Ativo').length;

  const membrosPorMinisterio = membros.reduce<Record<string, number>>((acc, membro) => {
    const key = membro.ministerio || 'Sem ministério';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const statusVisitantes = visitantes.reduce<Record<string, number>>((acc, visitante) => {
    acc[visitante.status] = (acc[visitante.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da igreja, membros, visitantes, células, eventos e financeiro."
      />

      <div className="stats-grid">
        <KpiCard label="Membros ativos" value={membrosAtivos} hint={`${membros.length} cadastrados`} />
        <KpiCard label="Visitantes pendentes" value={visitantesPendentes} hint="Precisam de acompanhamento" />
        <KpiCard label="Células" value={celulas.length} hint="Células cadastradas" />
        <KpiCard label="Eventos" value={eventos.length} hint="Eventos no calendário" />
        <KpiCard label="Entradas" value={moedaBR(entradas)} hint="Financeiro registrado" />
        <KpiCard label="Saldo" value={moedaBR(saldo)} hint="Entradas menos saídas" />
      </div>

      <div className="dashboard-grid">
        <ChartBox
          title="Membros por ministério"
          subtitle="Distribuição dos membros cadastrados por área de atuação."
          labels={Object.keys(membrosPorMinisterio)}
          values={Object.values(membrosPorMinisterio)}
        />
        <ChartBox
          title="Status dos visitantes"
          subtitle="Acompanhamento de integração e retorno."
          labels={Object.keys(statusVisitantes)}
          values={Object.values(statusVisitantes)}
          type="doughnut"
        />
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>Alertas pastorais e administrativos</h3>
            <span>Itens que precisam de conferência manual.</span>
          </div>
        </div>
        <div className="modal-body insights">
          <div className="insight warning">
            <h4>Visitantes sem integração</h4>
            <p>{visitantesPendentes} visitante(s) ainda precisam de retorno ou acompanhamento.</p>
          </div>
          <div className="insight success">
            <h4>Células ativas</h4>
            <p>{celulas.filter((c) => c.status === 'Ativa').length} célula(s) estão ativas no momento.</p>
          </div>
          <div className="insight danger">
            <h4>Cadastros a revisar</h4>
            <p>{membros.filter((m) => !m.telefone || !m.email).length} membro(s) com telefone ou e-mail ausente.</p>
          </div>
        </div>
      </div>
    </>
  );
}
