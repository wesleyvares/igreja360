import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebaseEnabled, storage } from '../firebase/config';
import { AnexoSolicitacao, AppUser } from '../types';

function lerDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function nomeSeguro(nome: string) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function salvarAnexoSolicitacao(file: File, user: AppUser): Promise<AnexoSolicitacao> {
  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) throw new Error('Anexe PDF, JPG, PNG ou WEBP.');

  const limite = firebaseEnabled ? 10 * 1024 * 1024 : 1.5 * 1024 * 1024;
  if (file.size > limite) {
    throw new Error(firebaseEnabled ? 'O arquivo deve ter até 10 MB.' : 'No modo demonstração, cada arquivo deve ter até 1,5 MB.');
  }

  if (!firebaseEnabled || !storage) {
    return { nome: file.name, tipo: file.type, tamanho: file.size, url: await lerDataUrl(file) };
  }

  const storagePath = `igrejas/${user.igrejaId}/solicitacoes/${user.uid}/${crypto.randomUUID()}-${nomeSeguro(file.name)}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  return { nome: file.name, tipo: file.type, tamanho: file.size, url, storagePath };
}
