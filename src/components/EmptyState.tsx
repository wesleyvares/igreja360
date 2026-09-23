export default function EmptyState({ text = 'Nenhum registro encontrado.' }: { text?: string }) {
  return <div className="empty">{text}</div>;
}
