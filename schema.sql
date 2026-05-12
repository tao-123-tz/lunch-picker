-- 「中午吃什么」Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 菜品表
CREATE TABLE IF NOT EXISTS dishes (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nickname    TEXT NOT NULL,
  name        TEXT NOT NULL CHECK (char_length(name) <= 20),
  image_url   TEXT NOT NULL DEFAULT '',
  tags        JSONB NOT NULL DEFAULT '{"taste":"not_spicy","type":"rice","cuisine":"chinese"}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 历史记录表
CREATE TABLE IF NOT EXISTS history (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nickname    TEXT NOT NULL,
  dish_id     BIGINT NOT NULL,
  dish_name   TEXT NOT NULL,
  dish_image  TEXT NOT NULL DEFAULT '',
  tags        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_dishes_nickname ON dishes(nickname);
CREATE INDEX IF NOT EXISTS idx_history_nickname ON history(nickname);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);

-- 4. 行级安全 (RLS): 用户只能读写自己的数据
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- dishes 策略
CREATE POLICY "dishes_select" ON dishes FOR SELECT
  USING (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

CREATE POLICY "dishes_insert" ON dishes FOR INSERT
  WITH CHECK (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

CREATE POLICY "dishes_update" ON dishes FOR UPDATE
  USING (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

CREATE POLICY "dishes_delete" ON dishes FOR DELETE
  USING (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

-- history 策略
CREATE POLICY "history_select" ON history FOR SELECT
  USING (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

CREATE POLICY "history_insert" ON history FOR INSERT
  WITH CHECK (nickname = current_setting('request.jwt.claims', true)::json->>'nickname');

-- 5. 存储桶 (在 Supabase Storage 界面手动创建，命名为 dish-images)
-- 或者在 SQL Editor 执行:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dish-images', 'dish-images', true);

-- 存储桶 RLS
-- CREATE POLICY "images_select" ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');
-- CREATE POLICY "images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'dish-images');
-- CREATE POLICY "images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'dish-images');
