import { useState } from 'react';

interface Props {
  onLogin: (name: string) => boolean;
}

export default function LoginPage({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('请输入你的昵称');
      return;
    }
    if (name.trim().length > 10) {
      setError('昵称最多 10 个字');
      return;
    }
    const ok = onLogin(name);
    if (!ok) setError('登录失败，请重试');
  };

  return (
    <div
      className="page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #C41E1A 0%, #A01814 100%)',
      }}
    >
      {/* Logo 区 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎋</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#FFF', marginBottom: 8 }}>
          中午吃什么
        </h1>
        <p style={{ color: '#D4A853', fontSize: 15 }}>
          摇一摇，决定你的午餐
        </p>
      </div>

      {/* 登录表单 */}
      <div
        style={{
          backgroundColor: '#FFF',
          borderRadius: 20,
          padding: '32px 24px',
          width: '100%',
          maxWidth: 340,
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          输入昵称开始使用
        </h2>
        <p style={{ color: '#8B7355', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
          每个人独立数据，互不干扰
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="你的昵称（最多10字）"
            maxLength={10}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
            style={{
              width: '100%',
              height: 48,
              padding: '0 16px',
              borderRadius: 12,
              border: error ? '2px solid #C41E1A' : '2px solid #E8D5B7',
              fontSize: 16,
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#C41E1A', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              height: 48,
              fontSize: 17,
              fontWeight: 600,
              marginTop: 20,
              borderRadius: 12,
            }}
          >
            开始使用
          </button>
        </form>
      </div>

      {/* 底部 */}
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 32 }}>
        数据存储在云端，随时随地访问
      </p>
    </div>
  );
}
