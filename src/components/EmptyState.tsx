interface Props {
  icon: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, text, actionText, onAction }: Props) {
  return (
    <div className="empty-container">
      <div className="empty-icon">{icon}</div>
      <p style={{ marginBottom: 24 }}>{text}</p>
      {actionText && onAction && (
        <button className="btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
