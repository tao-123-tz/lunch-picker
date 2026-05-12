import { useState, useRef, useEffect, useCallback } from 'react';
import type { Dish } from '../types';
import { TAG_LABEL_MAP } from '../utils/constants';

interface Props {
  dishes: Dish[];
  autoTrigger?: boolean;
  onConfirm: (dish: Dish) => void;
  onReshake: () => void;
}

export default function ShakeBox({ dishes, autoTrigger, onConfirm, onReshake }: Props) {
  const [state, setState] = useState<'idle' | 'shaking' | 'result'>('idle');
  const [rollingName, setRollingName] = useState('');
  const [picked, setPicked] = useState<Dish | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const stateRef = useRef(state);
  stateRef.current = state;

  const trigger = useCallback(() => {
    if (stateRef.current === 'shaking') return;
    if (dishes.length === 0) return;

    // 只有1道菜时提示
    if (dishes.length === 1) {
      // toast 提示由父级处理
    }

    setState('shaking');
    setPicked(null);
    setRollingName('');

    // 清除旧定时器
    if (timerRef.current) clearTimeout(timerRef.current);

    const target = dishes[Math.floor(Math.random() * dishes.length)];

    // 600ms 后开始轮播
    const t1 = setTimeout(() => {
      let tickCount = 0;
      const fastTicks = 10;

      const tick = () => {
        if (tickCount >= fastTicks + 4) return;
        const idx = Math.floor(Math.random() * dishes.length);
        setRollingName(dishes[idx].name);
        tickCount++;
        const interval = tickCount < fastTicks ? 50 : 150;
        timerRef.current = setTimeout(tick, interval);
      };
      tick();
    }, 600);

    // 2000ms 定格
    const t2 = setTimeout(() => {
      setState('result');
      setPicked(target);
      setRollingName('');
    }, 2000);
  }, [dishes]);

  // autoTrigger 时自动触发
  useEffect(() => {
    if (autoTrigger) {
      // 短暂延迟让 DOM 渲染完成
      const t = setTimeout(() => trigger(), 100);
      return () => clearTimeout(t);
    }
  }, [autoTrigger, trigger]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleConfirm = () => {
    if (picked) {
      onConfirm(picked);
      setState('idle');
      setPicked(null);
    }
  };

  const handleReshake = () => {
    onReshake();
    setState('idle');
    setPicked(null);
    setTimeout(() => trigger(), 150);
  };

  const pickedTags = picked
    ? [TAG_LABEL_MAP[picked.tags.taste], TAG_LABEL_MAP[picked.tags.type], TAG_LABEL_MAP[picked.tags.cuisine]].filter(Boolean)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 420 }}>
      {/* idle / shaking */}
      {(state === 'idle' || state === 'shaking') && (
        <div style={{ textAlign: 'center' }}>
          {/* 签筒 */}
          <div
            className={state === 'shaking' ? 'barrel-shaking' : ''}
            onClick={trigger}
            style={{
              width: 180, height: 220, margin: '0 auto 16px',
              cursor: 'pointer', userSelect: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <svg viewBox="0 0 180 220" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B6914" />
                  <stop offset="30%" stopColor="#D4A853" />
                  <stop offset="50%" stopColor="#C49B3C" />
                  <stop offset="70%" stopColor="#D4A853" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
              </defs>
              <rect x="30" y="40" width="120" height="150" rx="16" fill="url(#wood)" />
              <ellipse cx="90" cy="40" rx="60" ry="16" fill="#A0782C" />
              <ellipse cx="90" cy="40" rx="54" ry="12" fill="#4A3000" />
              <ellipse cx="90" cy="190" rx="60" ry="16" fill="#8B6914" />
              <rect x="78" y="10" width="6" height="50" rx="2" fill="#C41E1A" />
              <rect x="88" y="0" width="6" height="60" rx="2" fill="#D4A853" />
              <rect x="98" y="20" width="6" height="40" rx="2" fill="#C41E1A" />
            </svg>
          </div>

          {/* 轮播 */}
          {rollingName && (
            <div style={{
              fontSize: 32, fontWeight: 700, color: 'var(--color-primary)',
              minHeight: 48, transition: 'opacity 0.05s',
            }}>
              {rollingName}
            </div>
          )}

          {/* 提示 */}
          {state === 'idle' && (
            <div style={{ color: 'var(--color-text-light)', marginTop: 8 }}>
              <div>摇一摇或点击签筒</div>
              <div style={{ fontSize: 'var(--font-small)', opacity: 0.6, marginTop: 4 }}>
                随机选择今天的午餐
              </div>
            </div>
          )}
          {state === 'shaking' && (
            <div style={{
              color: 'var(--color-accent)', fontWeight: 600, marginTop: 8,
              animation: 'pulse 0.6s infinite',
            }}>
              抽签中...
            </div>
          )}
        </div>
      )}

      {/* result */}
      {state === 'result' && picked && (
        <div style={{
          textAlign: 'center',
          animation: 'resultPop 0.5s ease-out forwards',
        }}>
          <div style={{
            width: 260, height: 260, borderRadius: 'var(--radius-lg)',
            margin: '0 auto 20px', overflow: 'hidden',
            boxShadow: 'var(--shadow-pop)', backgroundColor: 'var(--color-bg-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {picked.imageDataUrl ? (
              <img src={picked.imageDataUrl} alt={picked.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 80 }}>🍽️</span>
            )}
          </div>

          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            {picked.name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {pickedTags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 32, justifyContent: 'center' }}>
            <button className="btn-primary" style={{ minWidth: 140 }} onClick={handleConfirm}>
              就它了！
            </button>
            <button className="btn-outline" style={{ minWidth: 140 }} onClick={handleReshake}>
              再摇一次
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
