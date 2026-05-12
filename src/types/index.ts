/** 口味标签 */
export type TasteTag = 'spicy' | 'not_spicy' | 'mild_spicy' | 'sweet_sour';

/** 类型标签 */
export type TypeTag = 'rice' | 'noodle' | 'vermicelli' | 'snack' | 'fast_food' | 'other';

/** 菜系标签 */
export type CuisineTag = 'chinese' | 'western' | 'japanese' | 'korean' | 'southeast_asian' | 'other';

/** 菜品标签 */
export interface DishTags {
  taste: TasteTag;
  type: TypeTag;
  cuisine: CuisineTag;
}

/** 菜品数据模型 */
export interface Dish {
  id: number;
  name: string;
  /** 图片 base64 data URL 或 Supabase Storage URL */
  imageDataUrl: string;
  tags: DishTags;
  createTime: number; // timestamp
  updateTime: number;
}

/** 历史记录 */
export interface HistoryRecord {
  id: string;
  dishId: string;
  dishName: string;
  dishImage: string;
  tags: DishTags;
  resultTime: number; // timestamp
}

/** 标签筛选条件 */
export interface FilterSelection {
  taste: TasteTag[];
  type: TypeTag[];
  cuisine: CuisineTag[];
}

/** 标签选项配置 */
export interface TagOption {
  key: string;
  label: string;
  icon: string;
}

/** 标签组定义 */
export interface TagGroup {
  name: string;
  field: keyof DishTags;
  options: TagOption[];
}

/** 预置菜品定义 */
export interface PresetDish {
  name: string;
  emoji: string;
  tags: DishTags;
}
