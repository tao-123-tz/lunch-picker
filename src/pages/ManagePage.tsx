import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DishCard from '../components/DishCard';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { showToast } from '../components/Toast';
import type { Dish } from '../types';
import { getAllDishes, deleteDish } from '../lib/db';

export default function ManagePage() {
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);

  const load = async () => {
    try {
      const data = await getAllDishes();
      setDishes(data);
    } catch (e: any) {
      showToast('加载失败: ' + (e?.message || ''));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDish(deleteTarget.id);
      setDeleteTarget(null);
      showToast('已删除');
      load();
    } catch {
      showToast('删除失败');
    }
  };

  if (loading) return <div className="loading-hint">加载中...</div>;

  return (
    <div className="page">
      <div className="nav-bar" style={{ margin: '-16px -16px 16px', borderRadius: '0 0 16px 16px' }}>
        <button className="nav-back" onClick={() => navigate(-1)}>‹</button>
        <span className="nav-title">我的菜单</span>
        <button
          onClick={() => navigate('/add')}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF',
            borderRadius: 16, padding: '6px 16px', fontSize: 13,
          }}
        >
          + 添加
        </button>
      </div>

      <div style={{ color: 'var(--color-text-light)', marginBottom: 16, fontSize: 'var(--font-small)' }}>
        共 {dishes.length} 道菜
      </div>

      {dishes.length === 0 ? (
        <EmptyState
          icon="🍽️"
          text="还没有菜品"
          actionText="添加菜品"
          onAction={() => navigate('/add')}
        />
      ) : (
        dishes.map((d) => (
          <DishCard
            key={d.id}
            dish={d}
            mode="manage"
            onTap={(dish) => navigate(`/add/${dish.id}`)}
            onDelete={setDeleteTarget}
          />
        ))
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="确认删除"
        message={`确定删除【${deleteTarget?.name || ''}】吗？删除后不可恢复。`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast />
    </div>
  );
}
