import type { TagGroup, PresetDish, FilterSelection } from '../types';

/** 加速度计参数 */
export const SHAKE_THRESHOLD = 15; // m/s² (约1.5g)
export const SHAKE_COOLDOWN = 3000; // ms

/** 动画参数 */
export const ANIMATION_DURATION = 2000;
export const ROLLING_FAST_INTERVAL = 50;
export const ROLLING_SLOW_INTERVAL = 150;

/** 分页 */
export const PAGE_SIZE = 20;

/** localStorage key */
export const STORAGE_KEYS = {
  DISHES: 'lunch_dishes',
  HISTORY: 'lunch_history',
};

/** 标签组 */
export const TAG_GROUPS: TagGroup[] = [
  {
    name: '口味',
    field: 'taste',
    options: [
      { key: 'spicy', label: '辣', icon: '🌶️' },
      { key: 'not_spicy', label: '不辣', icon: '🥬' },
      { key: 'mild_spicy', label: '微辣', icon: '🌤️' },
      { key: 'sweet_sour', label: '酸甜', icon: '🍬' },
    ],
  },
  {
    name: '类型',
    field: 'type',
    options: [
      { key: 'rice', label: '米饭', icon: '🍚' },
      { key: 'noodle', label: '面食', icon: '🍜' },
      { key: 'vermicelli', label: '粉类', icon: '🍝' },
      { key: 'snack', label: '小吃', icon: '🍢' },
      { key: 'fast_food', label: '快餐', icon: '🍔' },
      { key: 'other', label: '其他', icon: '📦' },
    ],
  },
  {
    name: '菜系',
    field: 'cuisine',
    options: [
      { key: 'chinese', label: '中餐', icon: '🥡' },
      { key: 'western', label: '西餐', icon: '🍕' },
      { key: 'japanese', label: '日料', icon: '🍣' },
      { key: 'korean', label: '韩料', icon: '🥩' },
      { key: 'southeast_asian', label: '东南亚', icon: '🍛' },
      { key: 'other', label: '其他', icon: '📦' },
    ],
  },
];

/** 标签 key → 显示文本映射 */
export const TAG_LABEL_MAP: Record<string, string> = {};
TAG_GROUPS.forEach((g) => {
  g.options.forEach((o) => {
    TAG_LABEL_MAP[o.key] = `${o.icon}${o.label}`;
  });
});

/** 预置菜品 */
export const PRESET_DISHES: PresetDish[] = [
  { name: '黄焖鸡米饭', emoji: '🍲', tags: { taste: 'spicy', type: 'rice', cuisine: 'chinese' } },
  { name: '麻辣烫', emoji: '🥘', tags: { taste: 'spicy', type: 'snack', cuisine: 'chinese' } },
  { name: '番茄鸡蛋面', emoji: '🍜', tags: { taste: 'not_spicy', type: 'noodle', cuisine: 'chinese' } },
  { name: '宫保鸡丁盖饭', emoji: '🍛', tags: { taste: 'mild_spicy', type: 'rice', cuisine: 'chinese' } },
  { name: '兰州拉面', emoji: '🍜', tags: { taste: 'not_spicy', type: 'noodle', cuisine: 'chinese' } },
  { name: '寿司拼盘', emoji: '🍣', tags: { taste: 'not_spicy', type: 'other', cuisine: 'japanese' } },
  { name: '汉堡套餐', emoji: '🍔', tags: { taste: 'not_spicy', type: 'fast_food', cuisine: 'western' } },
  { name: '酸辣粉', emoji: '🍝', tags: { taste: 'spicy', type: 'vermicelli', cuisine: 'chinese' } },
];

/** 默认空筛选 */
export const DEFAULT_FILTER: FilterSelection = {
  taste: [],
  type: [],
  cuisine: [],
};
