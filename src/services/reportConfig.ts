export type ReportBrandConfig = {
  nomeIgreja: string;
  cabecalhoRelatorios: string;
  corPrimaria: string;
  logoDataUrl: string;
};

export type FinancialWorkflowConfig = {
  valorMinimoOrcamentos: number;
  quantidadeOrcamentos: number;
};

function key(igrejaId: string, tipo: string) {
  return `igreja360_${igrejaId || 'igreja-demo'}_${tipo}`;
}

export function getReportBrandConfig(igrejaId: string): ReportBrandConfig {
  const padrao: ReportBrandConfig = {
    nomeIgreja: 'Igreja Casa do Céu',
    cabecalhoRelatorios: 'Relatório oficial da igreja',
    corPrimaria: '#1e3a8a',
    logoDataUrl: ''
  };
  const raw = localStorage.getItem(key(igrejaId, 'report_brand'));
  if (!raw) return padrao;
  try { return { ...padrao, ...JSON.parse(raw) }; } catch { return padrao; }
}

export function saveReportBrandConfig(igrejaId: string, config: ReportBrandConfig) {
  localStorage.setItem(key(igrejaId, 'report_brand'), JSON.stringify(config));
}

export function getFinancialWorkflowConfig(igrejaId: string): FinancialWorkflowConfig {
  const padrao: FinancialWorkflowConfig = {
    valorMinimoOrcamentos: 500,
    quantidadeOrcamentos: 3
  };
  const raw = localStorage.getItem(key(igrejaId, 'financial_workflow'));
  if (!raw) return padrao;
  try { return { ...padrao, ...JSON.parse(raw) }; } catch { return padrao; }
}

export function saveFinancialWorkflowConfig(igrejaId: string, config: FinancialWorkflowConfig) {
  localStorage.setItem(key(igrejaId, 'financial_workflow'), JSON.stringify(config));
}
