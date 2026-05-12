import { supabase } from './supabase';
import type { Dish, HistoryRecord, DishTags, FilterSelection } from '../types';
import { PRESET_DISHES } from '../utils/constants';

function getNickname(): string {
  return localStorage.getItem('lunch_nickname') || '';
}

// ====== Dishes ======

export async function getAllDishes(): Promise<Dish[]> {
  const nickname = getNickname();
  if (!nickname) return [];

  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('nickname', nickname)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 首次使用：预置示例菜品
  if (!data || data.length === 0) {
    const preset: Dish[] = PRESET_DISHES.map((p, i) => ({
      id: 0,
      name: p.name,
      imageDataUrl: '',
      tags: p.tags,
      createTime: Date.now() + i,
      updateTime: Date.now() + i,
    }));

    for (const p of preset) {
      await addDish({
        name: p.name,
        imageDataUrl: '',
        tags: p.tags,
      });
    }

    return getAllDishes(); // 重新查询获取真实 ID
  }

  return (data as any[]).map(rowToDish);
}

export async function getDishById(id: number): Promise<Dish | null> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToDish(data as any);
}

export async function addDish(input: {
  name: string;
  imageDataUrl: string;
  tags: DishTags;
}): Promise<number> {
  const nickname = getNickname();
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
}

export async function updateDish(
  id: number,
  input: { name: string; imageDataUrl: string; tags: DishTags }
): Promise<void> {
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
}

export async function deleteDish(id: number): Promise<void> {
  const { error } = await supabase.from('dishes').delete().eq('id', id);
  if (error) throw error;
}

// ====== History ======

export async function getAllHistory(): Promise<HistoryRecord[]> {
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
}

export async function addHistory(record: {
  dishId: number;
  dishName: string;
  dishImage: string;
  tags: DishTags;
}): Promise<void> {
  const nickname = getNickname();
  const { error } = await supabase.from('history').insert({
    nickname,
    dish_id: record.dishId,
    dish_name: record.dishName,
    dish_image: record.dishImage,
    tags: record.tags,
  });

  if (error) throw error;
}

// ====== Helpers ======

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
