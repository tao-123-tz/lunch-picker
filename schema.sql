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

-- 4. RLS: 允许所有 anon 操作（应用层通过 nickname 字段做过滤）
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- 使用 anon key 时，允许所有操作（应用代码负责过滤）
CREATE POLICY "dishes_all" ON dishes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "history_all" ON history FOR ALL TO anon USING (true) WITH CHECK (true);
