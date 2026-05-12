import { useEffect, useState, useCallback } from 'react';

let showToastFn: ((text: string) => void) | null = null;

/** 外部调用：showToast('消息') */
export function showToast(text: string) {
  showToastFn?.(text);
}

export default function Toast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const show = useCallback((text: string) => {
    setMessage(text);
    setVisible(true);
    setTimeout(() => setVisible(false), 2000);
  }, []);

  useEffect(() => {
    showToastFn = show;
    return () => { showToastFn = null; };
  }, [show]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      zIndex: 300, backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF',
      padding: '12px 24px', borderRadius: '24px', fontSize: 'var(--font-body)',
      pointerEvents: 'none', animation: 'toastIn 0.3s ease',
    }}>
      {message}
    </div>
  );
}
