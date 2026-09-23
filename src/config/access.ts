import { PerfilUsuario } from '../types';

export const accessByPath: Record<string, PerfilUsuario[]> = {
  '/dashboard': ['pastor', 'admin', 'secretaria', 'tesoureiro', 'lider', 'midia'],
  '/membros': ['pastor', 'admin', 'secretaria'],
  '/visitantes': ['pastor', 'admin', 'secretaria', 'lider'],
  '/celulas': ['pastor', 'admin', 'secretaria', 'lider'],
  '/relatorios-celula': ['pastor', 'admin', 'lider'],
  '/financeiro': ['pastor', 'admin', 'tesoureiro'],
  '/eventos': ['pastor', 'admin', 'secretaria', 'midia'],
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
