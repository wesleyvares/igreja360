import { FormEvent, useMemo, useState } from 'react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { Celula, ParticipanteCelula } from '../types';
import { normalizarBusca } from '../utils/format';

function formatarCep(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

function cepValido(valor: string) {
  const digitos = valor.replace(/\D/g, '');
  return /^\d{8}$/.test(digitos) && !/^(\d)\1{7}$/.test(digitos);
}

const initialForm: Omit<Celula, 'id'> = {
  igrejaId: '', nome: '', lider: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: 'ES',
  diaSemana: '', horario: '', participantes: [], status: 'Ativa', ativo: true
};

export default function CelulasPage() {
  const { user } = useAuth();
  const podeGerenciar = Boolean(user && ['pastor', 'admin', 'secretaria'].includes(user.perfil));
  const { celulas, membros, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Celula | null>(null);
  const [form, setForm] = useState<Omit<Celula, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return celulas;
    return celulas.filter((c) => [c.nome, c.lider, c.bairro, c.cidade, c.status].some((x) => normalizarBusca(x || '').includes(q)));
  }, [busca, celulas]);

  function qtdMembrosAtivos(celulaId: string) {
    const celula = celulas.find((c) => c.id === celulaId);
    if (celula?.participantes?.length) return celula.participantes.filter((p) => p.status === 'Ativo').length;
    return membros.filter((m) => m.celulaId === celulaId && m.status === 'Ativo').length;
  }

  function adicionarParticipante() {
    const participante: ParticipanteCelula = {
      id: crypto.randomUUID(),
      nome: '',
      telefone: '',
      status: 'Ativo',
      dataEntrada: new Date().toISOString().slice(0, 10)
    };
    setForm((atual) => ({ ...atual, participantes: [...(atual.participantes || []), participante] }));
  }

  function atualizarParticipante(id: string, campo: keyof ParticipanteCelula, valor: string) {
    setForm((atual) => ({
      ...atual,
      participantes: (atual.participantes || []).map((p) => p.id === id ? { ...p, [campo]: valor } : p)
    }));
  }

  function removerParticipante(id: string) {
    setForm((atual) => ({ ...atual, participantes: (atual.participantes || []).filter((p) => p.id !== id) }));
  }

  function enderecoCompleto(c: Celula) {
    return [c.logradouro, c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.cep].filter(Boolean).join(', ');
  }

  function novo() { setEditing(null); setForm({ ...initialForm, igrejaId: user?.igrejaId || '' }); setOpen(true); }
  function editar(row: Celula) {
    setEditing(row);
    const { id: _id, membros: _membros, ...rest } = row;
    setForm({ ...initialForm, ...rest });
    setOpen(true);
  }
  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome) return alert('Informe o nome da célula.');
    if (form.cep && !cepValido(form.cep)) return alert('Informe um CEP válido com 8 dígitos. Ex.: 29200-000.');
    if ((form.participantes || []).some((p) => !p.nome.trim())) return alert('Informe o nome de todos os participantes adicionados.');
    if (editing) await updateItem('celulas', editing.id, form);
    else await createItem('celulas', form);
    setOpen(false);
  }

  return (
    <>
      <PageHeader title="Células" subtitle="Cadastro de células. A quantidade de membros ativos é calculada automaticamente pelo cadastro dos membros." actions={podeGerenciar ? <button className="btn btn-primary" onClick={novo}>+ Nova célula</button> : undefined} />
      <div className="panel">
        <div className="panel-header"><div className="panel-title"><h3>Cadastro de células</h3><span>{rows.length} célula(s) cadastrada(s)</span></div><input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar célula" /></div>
        <DataTable<Celula> rows={rows} minWidth={1050} columns={[
          { header: 'Nome', render: (r) => <strong>{r.nome}</strong> },
          { header: 'Líder', render: (r) => r.lider || '-' },
          { header: 'Endereço', render: (r) => enderecoCompleto(r) || '-' },
          { header: 'Dia', render: (r) => r.diaSemana || '-' },
          { header: 'Horário', render: (r) => r.horario || '-' },
          { header: 'Membros ativos', render: (r) => <strong>{qtdMembrosAtivos(r.id)}</strong> },
          { header: 'Status', render: (r) => <Badge color={r.status === 'Ativa' ? 'green' : 'orange'}>{r.status}</Badge> },
          { header: 'Ações', render: (r) => podeGerenciar ? <div className="actions"><button className="icon-btn" onClick={() => editar(r)}>✏️</button><button className="icon-btn" onClick={() => removeItem('celulas', r.id)}>🗑️</button></div> : <Badge color="gray">Somente leitura</Badge> }
        ]} />
      </div>

      <Modal title={editing ? 'Editar célula' : 'Nova célula'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}><div className="form-grid">
          <FormField label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></FormField>
          <FormField label="Líder"><input value={form.lider} onChange={(e) => setForm({ ...form, lider: e.target.value })} /></FormField>
          <FormField label="CEP"><input value={form.cep} onChange={(e) => setForm({ ...form, cep: formatarCep(e.target.value) })} placeholder="00000-000" inputMode="numeric" maxLength={9} /></FormField>
          <FormField label="Logradouro"><input value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} placeholder="Rua, avenida..." /></FormField>
          <FormField label="Número"><input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></FormField>
          <FormField label="Complemento"><input value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} /></FormField>
          <FormField label="Bairro"><input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} /></FormField>
          <FormField label="Cidade"><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></FormField>
          <FormField label="Estado"><input value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase().slice(0, 2) })} /></FormField>
          <FormField label="Dia da semana"><input value={form.diaSemana} onChange={(e) => setForm({ ...form, diaSemana: e.target.value })} /></FormField>
          <FormField label="Horário"><input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} /></FormField>
          <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Celula['status'] })}><option>Ativa</option><option>Pausada</option><option>Em implantação</option></select></FormField>
        </div>
        <section className="cell-report-section">
          <div className="attendance-header">
            <div><h3>Participantes da célula</h3><p>Lista enxuta usada para gerar a chamada das reuniões sem liberar o módulo completo de membros.</p></div>
            <button className="btn btn-soft" type="button" onClick={adicionarParticipante}>+ Adicionar participante</button>
          </div>
          <div className="participant-editor-list">
            {(form.participantes || []).map((p) => (
              <div className="participant-editor-row" key={p.id}>
                <input value={p.nome} onChange={(e) => atualizarParticipante(p.id, 'nome', e.target.value)} placeholder="Nome" />
                <input value={p.telefone} onChange={(e) => atualizarParticipante(p.id, 'telefone', e.target.value)} placeholder="Telefone" inputMode="tel" />
                <input type="date" value={p.dataEntrada} onChange={(e) => atualizarParticipante(p.id, 'dataEntrada', e.target.value)} />
                <select value={p.status} onChange={(e) => atualizarParticipante(p.id, 'status', e.target.value)}><option>Ativo</option><option>Inativo</option></select>
                <button className="icon-btn" type="button" onClick={() => removerParticipante(p.id)} title="Remover participante">✕</button>
              </div>
            ))}
            {!(form.participantes || []).length && <div className="empty compact">Nenhum participante cadastrado nesta célula.</div>}
          </div>
        </section><div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div></form>
      </Modal>
    </>
  );
}
