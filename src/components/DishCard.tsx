import { useState } from 'react';
import type { Dish } from '../types';
import { TAG_LABEL_MAP } from '../utils/constants';

interface Props {
  dish: Dish;
  mode?: 'manage' | 'display';
  onTap?: (dish: Dish) => void;
  onDelete?: (dish: Dish) => void;
}

export default function DishCard({ dish, mode = 'display', onTap, onDelete }: Props) {
  const [swiped, setSwiped] = useState(false);
  const [startX, setStartX] = useState(0);

  const tags = [
    TAG_LABEL_MAP[dish.tags.taste],
    TAG_LABEL_MAP[dish.tags.type],
    TAG_LABEL_MAP[dish.tags.cuisine],
  ].filter(Boolean);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'manage') return;
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mode !== 'manage') return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -60) setSwiped(true);
    else setSwiped(false);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 12, overflow: 'hidden' }}>
      {/* 删除区域 */}
      {mode === 'manage' && swiped && (
        <button
          onClick={() => { onDelete?.(dish); setSwiped(false); }}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 90,
            backgroundColor: 'var(--color-danger)', color: '#FFF',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            fontSize: 'var(--font-body)', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}
        >
          删除
        </button>
      )}

      {/* 卡片主体 */}
      <div
        className="card"
        onClick={() => {
          if (swiped) { setSwiped(false); return; }
          onTap?.(dish);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: swiped ? 'translateX(-90px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
          cursor: 'pointer',
          padding: 12,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 图片 */}
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-sm)',
            flexShrink: 0, overflow: 'hidden',
            backgroundColor: 'var(--color-bg-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {dish.imageDataUrl ? (
              <img src={dish.imageDataUrl} alt={dish.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 32 }}>🍽️</span>
            )}
          </div>

          {/* 信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--font-body)', fontWeight: 600, marginBottom: 6,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dish.name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          {/* 箭头 */}
          {mode === 'manage' && (
            <span style={{ color: 'var(--color-text-light)', fontSize: 20, flexShrink: 0 }}>›</span>
          )}
        </div>
      </div>
    </div>
  );
}
