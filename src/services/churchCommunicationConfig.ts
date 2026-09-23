export type ChurchCommunicationConfig = {
  nomeIgreja: string;
  cultos: string;
  instagramUrl: string;
  endereco: string;
  assinatura: string;
};

const STORAGE_KEY = 'igreja360_comunicacao';

export const defaultChurchCommunicationConfig: ChurchCommunicationConfig = {
  nomeIgreja: 'Igreja Casa do Céu',
  cultos: 'Domingo às 19h',
  instagramUrl: '',
  endereco: '',
  assinatura: 'Equipe Casa do Céu'
};

export function getChurchCommunicationConfig(): ChurchCommunicationConfig {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultChurchCommunicationConfig;

  try {
    return { ...defaultChurchCommunicationConfig, ...JSON.parse(raw) };
  } catch {
    return defaultChurchCommunicationConfig;
  }
}

export function saveChurchCommunicationConfig(config: ChurchCommunicationConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
