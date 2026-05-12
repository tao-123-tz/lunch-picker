import type { FilterSelection, TasteTag, TypeTag, CuisineTag } from '../types';
import { TAG_GROUPS } from '../utils/constants';
import { useState, useEffect, useRef } from 'react';

interface Props {
  visible: boolean;
  filter: FilterSelection;
  onChange: (filter: FilterSelection) => void;
  onClose: () => void;
}

export default function FilterPanel({ visible, filter, onChange, onClose }: Props) {
  const [taste, setTaste] = useState<TasteTag[]>([]);
  const [type, setType] = useState<TypeTag[]>([]);
  const [cuisine, setCuisine] = useState<CuisineTag[]>([]);
  const prevVisible = useRef(false);

  useEffect(() => {
    if (visible && !prevVisible.current) {
      setTaste([...filter.taste]);
      setType([...filter.type]);
      setCuisine([...filter.cuisine]);
    }
    prevVisible.current = visible;
  }, [visible, filter]);

  const toggle = <T extends string>(
    key: T,
    current: T[],
    setter: (v: T[]) => void
  ) => {
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setter(next);
  };

  const apply = () => {
    onChange({ taste, type, cuisine } as FilterSelection);
    onClose();
  };

  const reset = () => {
    setTaste([]);
    setType([]);
    setCuisine([]);
    onChange({ taste: [], type: [], cuisine: [] });
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
          backgroundColor: '#FFF', borderRadius: '20px 20px 0 0',
          maxHeight: '75vh', display: 'flex', flexDirection: 'column',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 20px 12px',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>筛选条件</span>
          <button
            onClick={reset}
            style={{
              background: 'none', border: 'none', fontSize: 15,
              color: '#8B7355', cursor: 'pointer', padding: '4px 8px',
            }}
          >
            重置
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          {TAG_GROUPS.map((group) => {
            let values: any[];
            let setter: (v: any[]) => void;
            if (group.field === 'taste') { values = taste; setter = setTaste; }
            else if (group.field === 'type') { values = type; setter = setType; }
            else { values = cuisine; setter = setCuisine; }

            return (
              <div key={group.name} style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
                  {group.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {group.options.map((opt) => {
                    const active = values.includes(opt.key);
                    return (
                      <span
                        key={opt.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(opt.key, values, setter);
                        }}
                        style={{
                          display: 'inline-block',
                          padding: '10px 18px',
                          borderRadius: 20,
                          fontSize: 15,
                          cursor: 'pointer',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          backgroundColor: active ? '#C41E1A' : '#EBE4D5',
                          color: active ? '#FFF' : '#8B7355',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt.icon} {opt.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 20px' }}>
          <button
            onClick={apply}
            style={{
              width: '100%', height: 48, border: 'none',
              borderRadius: 12, backgroundColor: '#C41E1A', color: '#FFF',
              fontSize: 17, fontWeight: 600, cursor: 'pointer',
            }}
          >
            应用筛选
          </button>
        </div>
      </div>
    </>
  );
}
