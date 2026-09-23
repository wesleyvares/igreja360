import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, firebaseEnabled } from '../firebase/config';

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

const reportPadrao: ReportBrandConfig = {
  nomeIgreja: 'Igreja Casa do Céu',
  cabecalhoRelatorios: 'Relatório oficial da igreja',
  corPrimaria: '#1e3a8a',
  logoDataUrl: ''
};

const financeiroPadrao: FinancialWorkflowConfig = {
  valorMinimoOrcamentos: 500,
  quantidadeOrcamentos: 3
};

export function getReportBrandConfig(igrejaId: string): ReportBrandConfig {
  const raw = localStorage.getItem(key(igrejaId, 'report_brand'));
  if (!raw) return reportPadrao;
  try { return { ...reportPadrao, ...JSON.parse(raw) }; } catch { return reportPadrao; }
}

export async function saveReportBrandConfig(igrejaId: string, config: ReportBrandConfig) {
  localStorage.setItem(key(igrejaId, 'report_brand'), JSON.stringify(config));
  if (firebaseEnabled && db) {
    await setDoc(doc(db, 'configuracoes', igrejaId), { igrejaId, reportBrand: config }, { merge: true });
  }
}

export function getFinancialWorkflowConfig(igrejaId: string): FinancialWorkflowConfig {
  const raw = localStorage.getItem(key(igrejaId, 'financial_workflow'));
  if (!raw) return financeiroPadrao;
  try { return { ...financeiroPadrao, ...JSON.parse(raw) }; } catch { return financeiroPadrao; }
}

export async function saveFinancialWorkflowConfig(igrejaId: string, config: FinancialWorkflowConfig) {
  localStorage.setItem(key(igrejaId, 'financial_workflow'), JSON.stringify(config));
  if (firebaseEnabled && db) {
    await setDoc(doc(db, 'configuracoes', igrejaId), { igrejaId, financialWorkflow: config }, { merge: true });
  }
}

export async function syncChurchConfig(igrejaId: string) {
  if (!firebaseEnabled || !db) return;
  const snap = await getDoc(doc(db, 'configuracoes', igrejaId));
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.reportBrand) localStorage.setItem(key(igrejaId, 'report_brand'), JSON.stringify({ ...reportPadrao, ...data.reportBrand }));
  if (data.financialWorkflow) localStorage.setItem(key(igrejaId, 'financial_workflow'), JSON.stringify({ ...financeiroPadrao, ...data.financialWorkflow }));
}
