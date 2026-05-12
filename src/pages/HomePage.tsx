import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ShakeBox from '../components/ShakeBox';
import FilterPanel from '../components/FilterPanel';
import EmptyState from '../components/EmptyState';
import Toast, { showToast } from '../components/Toast';
import type { Dish, FilterSelection } from '../types';
import { DEFAULT_FILTER } from '../utils/constants';
import { getAllDishes, addHistory, filterDishes } from '../lib/db';
import { ShakeDetector } from '../utils/shake';

const shakeDetector = new ShakeDetector();

export default function HomePage() {
  const navigate = useNavigate();
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [filter, setFilter] = useState<FilterSelection>(DEFAULT_FILTER);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shakeCount, setShakeCount] = useState(0);

  const filtered = filterDishes(allDishes, filter);

  const loadDishes = useCallback(async () => {
    try {
      const dishes = await getAllDishes();
      setAllDishes(dishes);
    } catch (err) {
      console.error('加载菜品失败', err);
      showToast('加载失败，请检查网络');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadDishes(); }, [loadDishes]);

  // 返回时刷新
  useEffect(() => {
    const refresh = () => { loadDishes(); };
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
    };
  }, [loadDishes]);

  // 摇一摇 / 点击签筒 触发
  const triggerShake = useCallback(() => {
    if (filtered.length === 0) {
      showToast('还没有菜品，先去添加吧');
      return;
    }
    if (filtered.length === 1) {
      showToast('只有一道菜，快去多加点吧');
    }
    try { navigator.vibrate?.(200); } catch { /* ignore */ }
    setShakeCount((c) => c + 1);
  }, [filtered.length]);

  useEffect(() => {
    shakeDetector.start(triggerShake);
    return () => shakeDetector.stop();
  }, [triggerShake]);

  const handleConfirm = async (dish: Dish) => {
    try { navigator.vibrate?.(100); } catch { /* ignore */ }
    try {
      await addHistory({
        dishId: dish.id,
        dishName: dish.name,
        dishImage: dish.imageDataUrl,
        tags: dish.tags,
      });
    } catch {
      // 历史写入失败不阻塞
    }
  };

  if (loading) {
    return <div className="loading-hint">加载中...</div>;
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ textAlign: 'center', padding: '16px 0 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
          🎋 中午吃什么
        </h1>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {allDishes.length === 0 ? (
          <EmptyState
            icon="🍽️"
            text="还没有菜品，添加菜单开始摇签吧"
            actionText="添加菜品"
            onAction={() => navigate('/add')}
          />
        ) : (
          <div onClick={triggerShake} style={{ width: '100%' }}>
            <ShakeBox
              key={shakeCount}
              dishes={filtered}
              autoTrigger={shakeCount > 0}
              onConfirm={handleConfirm}
              onReshake={() => {}}
            />
          </div>
        )}
      </main>

      <nav style={{
        display: 'flex', gap: 12, padding: '16px 0 24px', justifyContent: 'center',
      }}>
        {allDishes.length > 0 && (
          <>
            <button className="btn-outline" style={{ flex: 1, maxWidth: 160, fontSize: 13 }}
              onClick={() => setFilterVisible(true)}>🏷️ 筛选</button>
            <button className="btn-outline" style={{ flex: 1, maxWidth: 160, fontSize: 13 }}
              onClick={() => navigate('/manage')}>📋 菜单</button>
          </>
        )}
        <button className="btn-outline" style={{ flex: 1, maxWidth: 160, fontSize: 13 }}
          onClick={() => navigate('/history')}>📅 历史</button>
      </nav>

      <FilterPanel
        visible={filterVisible}
        filter={filter}
        onChange={setFilter}
        onClose={() => setFilterVisible(false)}
      />
      <Toast />
    </div>
  );
}
