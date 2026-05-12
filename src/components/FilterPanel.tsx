import type { FilterSelection } from '../types';
import { TAG_GROUPS, DEFAULT_FILTER } from '../utils/constants';
import { useState, useEffect } from 'react';

interface Props {
  visible: boolean;
  filter: FilterSelection;
  onChange: (filter: FilterSelection) => void;
  onClose: () => void;
}

export default function FilterPanel({ visible, filter, onChange, onClose }: Props) {
  const [local, setLocal] = useState<FilterSelection>(DEFAULT_FILTER);

  // 仅在面板打开时同步外部筛选值一次
  useEffect(() => {
    if (visible) {
      setLocal(JSON.parse(JSON.stringify(filter)));
    }
  }, [visible]);

  const toggle = (field: keyof FilterSelection, key: string) => {
    setLocal((prev) => {
      const arr = [...prev[field]];
      const idx = arr.indexOf(key as any);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(key as any);
      return { ...prev, [field]: arr };
    });
  };

  const apply = () => {
    onChange(local);
    onClose();
  };

  const reset = () => {
    const f = { ...DEFAULT_FILTER };
    setLocal(f);
    onChange(f);
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      {/* 遮罩 */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease',
      }} />

      {/* 面板 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        maxHeight: '75vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* 头部 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 20px 12px',
        }}>
          <span style={{ fontSize: 'var(--font-title)', fontWeight: 700 }}>筛选条件</span>
          <button onClick={reset} style={{
            background: 'none', color: 'var(--color-text-light)', fontSize: 'var(--font-body)',
            border: 'none', cursor: 'pointer',
          }}>
            重置
          </button>
        </div>

        {/* 标签组 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {TAG_GROUPS.map((group) => (
            <div key={group.name} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 'var(--font-body)' }}>
                {group.name}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.options.map((opt) => {
                  const active = (local[group.field] as string[]).includes(opt.key);
                  return (
                    <span
                      key={opt.key}
                      className={`tag ${active ? 'tag--active' : ''}`}
                      onClick={() => toggle(group.field, opt.key)}
                      style={{ padding: '8px 16px', fontSize: 'var(--font-body)', cursor: 'pointer' }}
                    >
                      {opt.icon} {opt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 底部按钮 */}
        <div style={{ padding: '16px 20px 32px' }}>
          <button
            className="btn-primary"
            onClick={apply}
            style={{ width: '100%', height: 48, fontSize: 'var(--font-title)' }}
          >
            应用筛选
          </button>
        </div>
      </div>
    </>
  );
}
