import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useChurchData } from '../contexts/ChurchDataContext';
import { exportarXlsx } from '../services/exportXlsx';
import { dataBR, moedaBR } from '../utils/format';

type TipoRelatorio = 'membrosAtivos' | 'visitantesPendentes' | 'financeiroEntradas' | 'financeiroSaidas' | 'eventosAbertos';

export default function RelatoriosPage() {
  const { membros, visitantes, financeiro, eventos } = useChurchData();
  const [tipo, setTipo] = useState<TipoRelatorio>('membrosAtivos');

  const relatorio = useMemo(() => {
    if (tipo === 'membrosAtivos') return membros.filter((m) => m.status === 'Ativo').map((m) => ({ categoria: 'Membro', nome: m.nome, detalhe: m.ministerio, data: m.dataNascimento, valor: '' }));
    if (tipo === 'visitantesPendentes') return visitantes.filter((v) => v.status !== 'Integrado').map((v) => ({ categoria: 'Visitante', nome: v.nome, detalhe: v.status, data: v.dataVisita || v.primeiraVisita || '', valor: [v.bairro, v.cidade].filter(Boolean).join(' - ') }));
    if (tipo === 'financeiroEntradas') return financeiro.filter((f) => f.tipo === 'Entrada').map((f) => ({ categoria: f.categoria, nome: f.descricao, detalhe: f.formaPagamento, data: f.data, valor: moedaBR(f.valor) }));
    if (tipo === 'financeiroSaidas') return financeiro.filter((f) => f.tipo === 'Saída').map((f) => ({ categoria: f.categoria, nome: f.descricao, detalhe: f.formaPagamento, data: f.data, valor: moedaBR(f.valor) }));
    return eventos.filter((e) => e.status === 'Aberto' || e.status === 'Planejado').map((e) => ({ categoria: 'Evento', nome: e.titulo, detalhe: e.status, data: e.data, valor: e.local }));
  }, [tipo, membros, visitantes, financeiro, eventos]);

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Relatórios rápidos para gestão, conferência e exportação." actions={<button className="btn btn-soft" onClick={() => exportarXlsx(relatorio, `relatorio_${tipo}.csv`, 'Relatório')}>Exportar relatório</button>} />
      <div className="report-grid">
        <button className={`report-card button-card ${tipo === 'membrosAtivos' ? 'selected' : ''}`} onClick={() => setTipo('membrosAtivos')}><h3>Membros ativos</h3><p>Lista de membros ativos.</p></button>
        <button className={`report-card button-card ${tipo === 'visitantesPendentes' ? 'selected' : ''}`} onClick={() => setTipo('visitantesPendentes')}><h3>Visitantes pendentes</h3><p>Novos e em acompanhamento.</p></button>
        <button className={`report-card button-card ${tipo === 'financeiroEntradas' ? 'selected' : ''}`} onClick={() => setTipo('financeiroEntradas')}><h3>Entradas</h3><p>Dízimos, ofertas e receitas.</p></button>
        <button className={`report-card button-card ${tipo === 'financeiroSaidas' ? 'selected' : ''}`} onClick={() => setTipo('financeiroSaidas')}><h3>Saídas</h3><p>Despesas e pagamentos.</p></button>
        <button className={`report-card button-card ${tipo === 'eventosAbertos' ? 'selected' : ''}`} onClick={() => setTipo('eventosAbertos')}><h3>Eventos abertos</h3><p>Eventos planejados ou abertos.</p></button>
      </div>
      <div className="panel"><div className="panel-header"><div className="panel-title"><h3>Resultado</h3><span>{relatorio.length} item(ns)</span></div><Badge color="blue">{tipo}</Badge></div>
        <DataTable rows={relatorio} columns={[
          { header: 'Categoria', render: (r) => r.categoria },
          { header: 'Nome / descrição', render: (r) => <strong>{r.nome}</strong> },
          { header: 'Detalhe', render: (r) => r.detalhe || '-' },
          { header: 'Data', render: (r) => dataBR(r.data) },
          { header: 'Valor / local', render: (r) => r.valor || '-' }
        ]} />
      </div>
    </>
  );
}
