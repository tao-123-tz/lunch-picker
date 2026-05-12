import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from '../components/DishCard';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import type { HistoryRecord } from '../types';
import { getAllHistory } from '../lib/db';

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

interface Group {
  date: string;
  weekday: string;
  records: HistoryRecord[];
}

function groupByDate(records: HistoryRecord[]): Group[] {
  const map = new Map<string, HistoryRecord[]>();
  for (const r of records) {
    const d = new Date(r.resultTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(r);
  }
  return Array.from(map.entries()).map(([key, recs]) => {
    const d = new Date(key);
    return {
      date: `${d.getMonth() + 1}月${d.getDate()}日`,
      weekday: `周${WEEKDAY_NAMES[d.getDay()]}`,
      records: recs,
    };
  });
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllHistory()
      .then((records) => {
        setGroups(groupByDate(records));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-hint">加载中...</div>;

  return (
    <div className="page">
      <div className="nav-bar" style={{ margin: '-16px -16px 16px', borderRadius: '0 0 16px 16px' }}>
        <button className="nav-back" onClick={() => navigate(-1)}>‹</button>
        <span className="nav-title">历史记录</span>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon="📅"
          text="还没有抽签记录，去摇一签吧"
          actionText="去摇签"
          onAction={() => navigate('/')}
        />
      ) : (
        groups.map((g) => (
          <div key={g.date} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 12, paddingLeft: 4 }}>
              <span style={{ fontSize: 'var(--font-title)', fontWeight: 700, marginRight: 8 }}>
                {g.date}
              </span>
              <span style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-body)' }}>
                {g.weekday}
              </span>
            </div>

            {g.records.map((r) => (
              <DishCard
                key={r.id}
                dish={{
                  id: Number(r.dishId),
                  name: r.dishName,
                  imageDataUrl: r.dishImage,
                  tags: r.tags,
                  createTime: r.resultTime,
                  updateTime: r.resultTime,
                }}
                mode="display"
              />
            ))}
          </div>
        ))
      )}

      <Toast />
    </div>
  );
}
