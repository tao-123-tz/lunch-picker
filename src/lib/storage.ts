/**
 * 混合存储层
 * 优先使用 Supabase（云端多用户），失败时降级为 IndexedDB（本地单机）
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { Dish, HistoryRecord, DishTags, FilterSelection } from '../types';
import { PRESET_DISHES } from '../utils/constants';

const DB_NAME = 'lunch_picker_local';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('dishes')) {
          db.createObjectStore('dishes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ====== Dishes ======

export async function localGetAllDishes(): Promise<Dish[]> {
  const db = await getDB();
  const dishes = await db.getAll('dishes');

  if (dishes.length === 0) {
    const preset: Dish[] = PRESET_DISHES.map((p) => ({
      id: uid() as any,
      name: p.name,
      imageDataUrl: '',
      tags: p.tags,
      createTime: Date.now(),
      updateTime: Date.now(),
    }));
    const tx = db.transaction('dishes', 'readwrite');
    for (const d of preset) await tx.store.put(d);
    await tx.done;
    return preset;
  }

  return dishes.sort((a, b) => b.createTime - a.createTime);
}

export async function localGetDishById(id: number): Promise<Dish | null> {
  const db = await getDB();
  return (await db.get('dishes', id)) || null;
}

export async function localAddDish(input: {
  name: string;
  imageDataUrl: string;
  tags: DishTags;
}): Promise<number> {
  const db = await getDB();
  const dish: Dish = {
    id: uid() as any,
    name: input.name,
    imageDataUrl: input.imageDataUrl,
    tags: input.tags,
    createTime: Date.now(),
    updateTime: Date.now(),
  };
  await db.put('dishes', dish);
  return dish.id;
}

export async function localUpdateDish(
  id: number,
  input: { name: string; imageDataUrl: string; tags: DishTags }
): Promise<void> {
  const db = await getDB();
  const old = await db.get('dishes', id);
  if (!old) throw new Error('菜品不存在');
  await db.put('dishes', { ...old, ...input, updateTime: Date.now() });
}

export async function localDeleteDish(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('dishes', id);
}

// ====== History ======

export async function localGetAllHistory(): Promise<HistoryRecord[]> {
  const db = await getDB();
  const records = await db.getAll('history');
  return records.sort((a, b) => b.resultTime - a.resultTime);
}

export async function localAddHistory(record: {
  dishId: number;
  dishName: string;
  dishImage: string;
  tags: DishTags;
}): Promise<void> {
  const db = await getDB();
  await db.put('history', {
    id: uid(),
    ...record,
    resultTime: Date.now(),
  });
}

// ====== Filters ======

export function filterDishes(
  dishes: Dish[],
  filter: FilterSelection
): Dish[] {
  const hasActive =
    filter.taste.length > 0 ||
    filter.type.length > 0 ||
    filter.cuisine.length > 0;
  if (!hasActive) return dishes;

  return dishes.filter((d) => {
    if (filter.taste.length && !filter.taste.includes(d.tags.taste))
      return false;
    if (filter.type.length && !filter.type.includes(d.tags.type))
      return false;
    if (filter.cuisine.length && !filter.cuisine.includes(d.tags.cuisine))
      return false;
    return true;
  });
}
