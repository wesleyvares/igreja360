import { FormEvent, useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import FormField from '../components/FormField';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import WhatsAppVisitanteModal from '../components/WhatsAppVisitanteModal';
import { useAuth } from '../contexts/AuthContext';
import { useChurchData } from '../contexts/ChurchDataContext';
import { avisosVigentes, mensagemAvisosVigentes } from '../services/communication';
import { exportarXlsx } from '../services/exportXlsx';
import { abrirWhatsapp } from '../services/whatsapp';
import { Visitante } from '../types';
import { dataBR, normalizarBusca } from '../utils/format';

const faixasEtarias = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80+'];
const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'União estável', 'Divorciado(a)', 'Viúvo(a)', 'Outro'];
const comoConheceuOpcoes = ['Convite de amigo/familiar', 'Instagram', 'Evangelismo', 'Célula', 'Evento', 'Google/Internet', 'Passando em frente', 'Outro'];

const initialForm: Omit<Visitante, 'id'> = {
  igrejaId: '', nome: '', telefone: '', dataVisita: '', bairro: '', cidade: '', dataNascimento: '', faixaEtaria: '',
  estadoCivil: '', comoConheceu: '', membroOutraIgreja: 'Não', nomeOutraIgreja: '',
  status: 'Novo', responsavel: '', observacoes: '', ativo: true
};

export default function VisitantesPage() {
  const { user } = useAuth();
  const { visitantes, celulas, avisos, createItem, updateItem, removeItem } = useChurchData();
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Visitante | null>(null);
  const [whatsappVisitante, setWhatsappVisitante] = useState<Visitante | null>(null);
  const [form, setForm] = useState<Omit<Visitante, 'id'>>(initialForm);

  const rows = useMemo(() => {
    const q = normalizarBusca(busca);
    if (!q) return visitantes;
    return visitantes.filter((v) =>
      [v.nome, v.telefone, v.bairro, v.cidade, v.comoConheceu || v.origem || '', v.status, v.responsavel, v.nomeOutraIgreja]
        .some((x) => normalizarBusca(x || '').includes(q))
    );
  }, [busca, visitantes]);

  function novo() {
    setEditing(null);
    setForm({ ...initialForm, igrejaId: user?.igrejaId || '' });
    setOpen(true);
  }

  function editar(row: Visitante) {
    setEditing(row);
    const { id: _id, ...rest } = row;
    setForm({
      ...initialForm,
      ...rest,
      dataVisita: row.dataVisita || row.primeiraVisita || '',
      comoConheceu: row.comoConheceu || row.origem || '',
      igrejaId: row.igrejaId
    });
    setOpen(true);
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome) return alert('Informe o nome do visitante.');
    if (!form.dataVisita) return alert('Informe a data da visita.');
    if (!form.telefone) return alert('Informe o telefone com DDD.');
    if (form.membroOutraIgreja === 'Sim' && !form.nomeOutraIgreja.trim()) return alert('Informe o nome da igreja da qual o visitante é membro.');

    const criando = !editing;
    if (editing) await updateItem('visitantes', editing.id, form);
    else await createItem('visitantes', form);
    setOpen(false);

    if (criando && avisosVigentes(avisos).length) {
      const enviar = window.confirm('Visitante cadastrado. Existem avisos vigentes. Deseja abrir o WhatsApp com as boas-vindas/avisos atuais?');
      if (enviar) abrirWhatsapp(form.telefone, mensagemAvisosVigentes(form.nome, avisos));
    }
  }

  return (
    <>
      <PageHeader
        title="Visitantes"
        subtitle="Cadastro completo, acolhimento, retorno e integração de visitantes."
        actions={<><button className="btn btn-soft" onClick={() => exportarXlsx(rows, 'visitantes_igreja360.csv', 'Visitantes')}>Exportar XLSX</button><button className="btn btn-primary" onClick={novo}>+ Novo visitante</button></>}
      />

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><h3>Lista de visitantes</h3><span>{rows.length} registro(s) exibido(s) • WhatsApp disponível nas ações</span></div>
          <input className="search-input" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, bairro, cidade, igreja ou origem" />
        </div>
        <DataTable<Visitante>
          rows={rows}
          minWidth={1250}
          columns={[
            { header: 'Data da visita', render: (r) => dataBR(r.dataVisita || r.primeiraVisita || '') },
            { header: 'Nome', render: (r) => <strong>{r.nome}</strong> },
            { header: 'Bairro / Cidade', render: (r) => [r.bairro, r.cidade].filter(Boolean).join(' - ') || '-' },
            { header: 'Telefone', render: (r) => r.telefone || '-' },
            { header: 'Faixa etária', render: (r) => r.faixaEtaria || '-' },
            { header: 'Estado civil', render: (r) => r.estadoCivil || '-' },
            { header: 'Como conheceu', render: (r) => r.comoConheceu || r.origem || '-' },
            { header: 'Outra igreja?', render: (r) => r.membroOutraIgreja === 'Sim' ? <span>Sim • {r.nomeOutraIgreja || '-'}</span> : 'Não' },
            { header: 'Status', render: (r) => <Badge color={r.status === 'Integrado' ? 'green' : r.status === 'Sem retorno' ? 'red' : 'orange'}>{r.status}</Badge> },
            { header: 'Ações', render: (r) => (
              <div className="actions">
                <button className="icon-btn whatsapp-icon" title="Enviar WhatsApp" aria-label={`Enviar WhatsApp para ${r.nome}`} onClick={() => setWhatsappVisitante(r)} disabled={!r.telefone}><MessageCircle size={17} /></button>
                <button className="icon-btn" title="Editar visitante" onClick={() => editar(r)}>✏️</button>
                <button className="icon-btn" title="Excluir visitante" onClick={() => removeItem('visitantes', r.id)}>🗑️</button>
              </div>
            )}
          ]}
        />
      </div>

      <Modal title={editing ? 'Editar visitante' : 'Novo visitante'} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={salvar}>
          <div className="form-grid">
            <FormField label="Data da visita"><input type="date" value={form.dataVisita} onChange={(e) => setForm({ ...form, dataVisita: e.target.value })} /></FormField>
            <FormField label="Nome"><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></FormField>
            <FormField label="Telefone com DDD"><input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(27) 99999-9999" /></FormField>
            <FormField label="Bairro"><input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} /></FormField>
            <FormField label="Cidade"><input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} /></FormField>
            <FormField label="Data de nascimento"><input type="date" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} /></FormField>
            <FormField label="Faixa etária"><select value={form.faixaEtaria} onChange={(e) => setForm({ ...form, faixaEtaria: e.target.value })}><option value="">Selecione</option>{faixasEtarias.map((f) => <option key={f}>{f}</option>)}</select></FormField>
            <FormField label="Estado civil"><select value={form.estadoCivil} onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}><option value="">Selecione</option>{estadosCivis.map((v) => <option key={v}>{v}</option>)}</select></FormField>
            <FormField label="Como conheceu a igreja?"><select value={form.comoConheceu} onChange={(e) => setForm({ ...form, comoConheceu: e.target.value })}><option value="">Selecione</option>{comoConheceuOpcoes.map((v) => <option key={v}>{v}</option>)}</select></FormField>
            <FormField label="É membro de outra igreja?"><select value={form.membroOutraIgreja} onChange={(e) => setForm({ ...form, membroOutraIgreja: e.target.value as Visitante['membroOutraIgreja'], nomeOutraIgreja: e.target.value === 'Não' ? '' : form.nomeOutraIgreja })}><option>Não</option><option>Sim</option></select></FormField>
            {form.membroOutraIgreja === 'Sim' && <FormField label="Nome da igreja"><input value={form.nomeOutraIgreja} onChange={(e) => setForm({ ...form, nomeOutraIgreja: e.target.value })} /></FormField>}
            <FormField label="Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Visitante['status'] })}><option>Novo</option><option>Em acompanhamento</option><option>Integrado</option><option>Sem retorno</option></select></FormField>
            <FormField label="Responsável"><input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} /></FormField>
            <FormField label="Observações" full><textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></FormField>
          </div>
          <div className="modal-actions-right"><button className="btn btn-soft" type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="btn btn-success" type="submit">Salvar</button></div>
        </form>
      </Modal>

      <WhatsAppVisitanteModal open={Boolean(whatsappVisitante)} visitante={whatsappVisitante} celulas={celulas} onClose={() => setWhatsappVisitante(null)} />
    </>
  );
}
