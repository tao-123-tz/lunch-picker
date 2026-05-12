import { useEffect } from 'react';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ visible, title, message, onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }} onClick={onCancel}>
      <div style={{
        backgroundColor: 'var(--color-card)', borderRadius: 'var(--radius-lg)',
        padding: '32px 24px 24px', width: '300px', maxWidth: '85vw',
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 'var(--font-title)', fontWeight: 600, marginBottom: 12 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--color-text-light)', marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', backgroundColor: 'transparent',
              color: 'var(--color-text-light)', fontSize: 'var(--font-body)',
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger)', color: '#FFF',
              fontSize: 'var(--font-body)',
            }}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
