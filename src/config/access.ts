import { PerfilUsuario } from '../types';

export type AccessItem = {
  to: string;
  label: string;
  perfis: PerfilUsuario[];
};

export const PERFIS_INTERNOS: PerfilUsuario[] = ['pastor', 'admin', 'secretaria', 'tesoureiro', 'lider', 'midia'];

export const accessByPath: Record<string, PerfilUsuario[]> = {
  '/dashboard': ['pastor', 'admin', 'secretaria', 'tesoureiro', 'lider', 'midia'],
  '/membros': ['pastor', 'admin', 'secretaria'],
  '/visitantes': ['pastor', 'admin', 'secretaria', 'lider'],
  '/celulas': ['pastor', 'admin', 'secretaria', 'lider'],
  '/financeiro': ['pastor', 'admin', 'tesoureiro'],
  '/eventos': ['pastor', 'admin', 'secretaria', 'lider', 'midia'],
  '/relatorios': ['pastor', 'admin', 'secretaria', 'tesoureiro'],
  '/avisos': ['pastor', 'admin', 'secretaria', 'midia'],
  '/quadro-avisos': ['pastor', 'admin', 'secretaria', 'tesoureiro', 'lider', 'midia', 'membro', 'visitante'],
  '/radio': ['pastor', 'admin', 'secretaria', 'tesoureiro', 'lider', 'midia', 'membro', 'visitante'],
  '/configuracoes': ['pastor', 'admin']
};

export function podeAcessar(perfil: PerfilUsuario | undefined, path: string) {
  if (!perfil) return false;
  return (accessByPath[path] || []).includes(perfil);
}
