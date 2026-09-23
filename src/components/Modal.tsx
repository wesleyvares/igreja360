type ModalProps = {
  title: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ title, subtitle, open, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal open">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <button className="btn btn-soft" onClick={onClose}>Fechar</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
