/**
 * 统一数据层
 * 优先 Supabase（云端多用户），3 秒超时后降级 IndexedDB（本地单机）
 */

import { supabase } from './supabase';
import type { Dish, HistoryRecord, DishTags, FilterSelection } from '../types';
import {
  localGetAllDishes,
  localGetDishById,
  localAddDish,
  localUpdateDish,
  localDeleteDish,
  localGetAllHistory,
  localAddHistory,
  filterDishes,
} from './storage';

// Supabase 请求超时时间
const SUPABASE_TIMEOUT = 3000;

let supabaseAvailable = true;

/** 检查 Supabase 是否可用 */
async function isSupabaseOnline(): Promise<boolean> {
  if (!supabaseAvailable) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT);
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/dishes?limit=0`,
      {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    supabaseAvailable = res.ok;
    return res.ok;
  } catch {
    supabaseAvailable = false;
    console.warn('Supabase 不可用，降级为本地存储');
    return false;
  }
}

// ====== Dishes ======

export async function getAllDishes(): Promise<Dish[]> {
  const online = await isSupabaseOnline();

  if (online) {
    try {
      const nickname = getNickname();
      if (!nickname) return localGetAllDishes();

      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('nickname', nickname)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // 首次使用：云端预置示例菜品，同时同步到本地
        await supabase.from('dishes').insert(
          PRESET_NAMES.map((name, i) => ({
            nickname,
            name,
            tags: PRESET_TAGS[i],
            image_url: '',
          }))
        );
        return getAllDishes();
      }

      return (data as any[]).map(rowToDish);
    } catch {
      // Supabase 查询失败，降级
    }
  }

  return localGetAllDishes();
}

export async function getDishById(id: number): Promise<Dish | null> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) return rowToDish(data as any);
    } catch {}
  }
  return localGetDishById(id);
}

export async function addDish(input: {
  name: string;
  imageDataUrl: string;
  tags: DishTags;
}): Promise<number> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const nickname = getNickname();
      if (!nickname) throw new Error('未登录');

      const { data, error } = await supabase
        .from('dishes')
        .insert({
          nickname,
          name: input.name,
          image_url: input.imageDataUrl,
          tags: input.tags,
        })
        .select('id')
        .single();

      if (error) throw error;
      return (data as any).id;
    } catch (e: any) {
      // 如果是网络错误，降级到本地
      if (e?.code !== 'PGRST') throw e;
    }
  }
  return localAddDish(input);
}

export async function updateDish(
  id: number,
  input: { name: string; imageDataUrl: string; tags: DishTags }
): Promise<void> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const { error } = await supabase
        .from('dishes')
        .update({
          name: input.name,
          image_url: input.imageDataUrl,
          tags: input.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return;
    } catch {}
  }
  return localUpdateDish(id, input);
}

export async function deleteDish(id: number): Promise<void> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const { error } = await supabase.from('dishes').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch {}
  }
  return localDeleteDish(id);
}

// ====== History ======

export async function getAllHistory(): Promise<HistoryRecord[]> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const nickname = getNickname();
      if (!nickname) return [];

      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('nickname', nickname)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((r: any) => ({
        id: String(r.id),
        dishId: String(r.dish_id),
        dishName: r.dish_name,
        dishImage: r.dish_image,
        tags: r.tags as DishTags,
        resultTime: new Date(r.created_at).getTime(),
      }));
    } catch {}
  }
  return localGetAllHistory();
}

export async function addHistory(record: {
  dishId: number;
  dishName: string;
  dishImage: string;
  tags: DishTags;
}): Promise<void> {
  const online = await isSupabaseOnline();
  if (online) {
    try {
      const nickname = getNickname();
      if (!nickname) return;

      const { error } = await supabase.from('history').insert({
        nickname,
        dish_id: record.dishId,
        dish_name: record.dishName,
        dish_image: record.dishImage,
        tags: record.tags,
      });
      if (error) throw error;
      return;
    } catch {}
  }
  return localAddHistory(record);
}

// ====== Helpers ======

function getNickname(): string {
  return localStorage.getItem('lunch_nickname') || '';
}

function rowToDish(row: any): Dish {
  return {
    id: row.id,
    name: row.name,
    imageDataUrl: row.image_url || '',
    tags: row.tags as DishTags,
    createTime: new Date(row.created_at).getTime(),
    updateTime: new Date(row.updated_at).getTime(),
  };
}

const PRESET_NAMES = [
  '黄焖鸡米饭', '麻辣烫', '番茄鸡蛋面', '宫保鸡丁盖饭',
  '兰州拉面', '寿司拼盘', '汉堡套餐', '酸辣粉',
];

const PRESET_TAGS: DishTags[] = [
  { taste: 'spicy', type: 'rice', cuisine: 'chinese' },
  { taste: 'spicy', type: 'snack', cuisine: 'chinese' },
  { taste: 'not_spicy', type: 'noodle', cuisine: 'chinese' },
  { taste: 'mild_spicy', type: 'rice', cuisine: 'chinese' },
  { taste: 'not_spicy', type: 'noodle', cuisine: 'chinese' },
  { taste: 'not_spicy', type: 'other', cuisine: 'japanese' },
  { taste: 'not_spicy', type: 'fast_food', cuisine: 'western' },
  { taste: 'spicy', type: 'vermicelli', cuisine: 'chinese' },
];

export { filterDishes };
