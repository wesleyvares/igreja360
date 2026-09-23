export function telefoneParaWhatsapp(telefone: string) {
  const digits = String(telefone || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;

  return digits;
}

export function abrirWhatsapp(telefone: string, mensagem: string) {
  const numero = telefoneParaWhatsapp(telefone);
  if (!numero) throw new Error('Contato sem telefone cadastrado.');

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function compartilharNoWhatsapp(mensagem: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
