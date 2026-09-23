import PageHeader from '../components/PageHeader';

export default function RadioPage() {
  return (
    <>
      <PageHeader title="Rádio online" subtitle="Área preparada para incorporar o player da rádio da igreja." />
      <div className="panel">
        <div className="visual-hero">
          <div className="visual-hero-main">
            <div>
              <div className="visual-kicker">Rádio Casa do Céu</div>
              <h2 className="visual-nome">Player pronto para transmissão</h2>
              <p className="visual-subtitle">Cole aqui o iframe ou link do provedor da rádio. Esta página já está separada para virar área pública ou área do membro.</p>
            </div>
            <div className="visual-hero-actions">
              <button className="btn btn-primary">Configurar player</button>
              <button className="btn btn-soft">Ver instruções</button>
            </div>
          </div>
          <div className="visual-hero-metrics">
            <div className="visual-metric"><span>Status</span><strong>Pronto</strong></div>
            <div className="visual-metric"><span>Módulo</span><strong>Rádio</strong></div>
          </div>
        </div>
      </div>
    </>
  );
}
