# 「中午吃什么」部署指南

## 前提准备

### 1. 注册 Supabase（免费）
1. 打开 https://supabase.com → 点击「Start your project」
2. 用 GitHub 账号登录
3. 创建新项目：
   - Name: `lunch-picker`
   - Database Password: 设置一个强密码（记下来）
   - Region: 选 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)** 国内访问较快
   - Pricing Plan: Free
4. 等待项目创建完成（约 2 分钟）

### 2. 配置数据库
1. 在 Supabase 项目中，点击左侧「SQL Editor」
2. 点击「New query」
3. 复制本仓库 `schema.sql` 的全部内容，粘贴并执行（Ctrl+Enter）
4. 看到 "Success. No rows returned" 即成功

### 3. 配置本地环境变量
1. 在 Supabase 项目中，点击左侧「Settings」→「API」
2. 复制 `Project URL` 和 `anon public` key
3. 在项目根目录创建 `.env` 文件：
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon-key
```

### 4. 本地测试
```bash
npm install
npm run dev
```
打开 http://localhost:3000 测试

## 部署到 Vercel（免费）

### 1. 准备代码仓库
将代码推送到 GitHub：
```bash
git init
git add .
git commit -m "feat: 中午吃什么网页版"
# 在 GitHub 创建仓库后：
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 在 Vercel 部署
1. 打开 https://vercel.com → 用 GitHub 登录
2. 点击「New Project」
3. 导入你的 GitHub 仓库
4. Framework 自动识别为 Vite
5. 展开「Environment Variables」，添加两个环境变量：
   - `VITE_SUPABASE_URL` = 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase anon key
6. 点击「Deploy」
7. 等待部署完成，Vercel 会提供一个 `xxx.vercel.app` 域名

### 3. 分享给朋友
部署完成后，把 Vercel 提供的域名（如 `https://lunch-picker.vercel.app`）发给朋友即可。

每个人输入自己的昵称后数据完全独立，互不影响。

## 可选：自定义域名
在 Vercel 项目 Settings → Domains 中添加你自己的域名。

## 本地开发
```bash
npm run dev       # 开发服务器 http://localhost:3000
npm run build     # 生产构建到 dist/
npm run preview   # 预览生产构建
```
