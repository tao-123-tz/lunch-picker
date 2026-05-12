# 「中午吃什么」微信小程序 — 技术规范文档 (SPEC)

> 版本: v1.0  
> 日期: 2026-05-12  
> 状态: 待开发

---

## 一、产品概述

### 1.1 一句话描述
一款通过「物理摇一摇 + 抽签动效」从用户上传的菜品库中随机选出午餐的中国风微信小程序。

### 1.2 目标用户
有选择困难症、每天中午纠结吃什么的个人用户。

### 1.3 核心价值
- **决策刚需**：每天中午打开摇一摇，解决"吃什么"的终极难题
- **仪式感**：抽签动画 + 音效 + 震动反馈，让选饭变成有趣的事
- **社交货币**：结果可以分享到微信群，引发讨论

### 1.4 核心流程
```
打开小程序 → 首页"抽签筒" → 摇手机/点按钮 → 菜品快速轮播 → 定格结果 → 确认/再摇一次 → (可选)分享到群
```

---

## 二、技术选型

### 2.1 开发框架：微信原生开发

| 对比维度 | 原生 | Taro | uni-app |
|---------|------|------|---------|
| 动画性能 | 最优，直接操作 WXML | 需编译层，有损耗 | 需编译层，有损耗 |
| 传感器 API | 直接调用，无兼容问题 | 需 `Taro.startAccelerometer` 封装 | 需 `uni.startAccelerometer` 封装 |
| 云开发集成 | `wx.cloud` 原生支持 | 需额外配置 | 需额外配置 |
| 包体积 | 最小 | 有框架运行时开销 | 有框架运行时开销 |
| 调试体验 | 微信开发者工具最佳 | 需 sourcemap 映射 | 需 sourcemap 映射 |

**结论**：本项目仅需微信单平台、重度依赖传感器/动画/云开发，**原生开发是最优解**。

### 2.2 语言：TypeScript
- 利用类型系统减少运行时错误
- 云开发数据库操作有类型提示更安全

### 2.3 后端：微信云开发
| 能力 | 用途 | 免费额度 | 是否使用 |
|------|------|---------|---------|
| 云数据库 | 存储菜品、历史记录 | 2GB / 5万次读/天 | ✅ |
| 云存储 | 存储菜品图片 | 5GB / 10GB月下载 | ✅ |
| 云函数 | 图片安全审核 | 4万次/月 | ✅（仅审核） |

---

## 三、小程序注册与审核策略

### 3.1 注册主体：个人
- 类目选择：**工具 > 效率工具**
- 无需营业执照，仅需身份证
- 认证费：个人主体免费（企业认证300元/年）

### 3.2 提高审核通过率的关键措施

**必须做到：**
1. **先体验后登录**：进入小程序直接可用，不弹授权框。仅在需要云同步时才静默调用 `wx.login()`
2. **功能完整**：至少 3 个页面（首页/管理/历史），功能闭环完整，不能只有一个按钮
3. **无社交属性**：只用 `wx.shareAppMessage()` 原生分享，不自建评论区或UGC
4. **无付费/无诱导**：没有任何付费功能，没有任何诱导分享/下载文案
5. **隐私保护指引**：小程序后台必须声明「调用你的加速传感器」
6. **图片内容安全**：用户上传图片需经云函数调用 `security.imgSecCheck` 审核
7. **HTTPS**：云开发自带 HTTPS，无需额外配置

**命名建议**（按优先级，防止被占用）：
1. 「中午吃什么」
2. 「摇签选午餐」
3. 「午餐吃什么摇一摇」
4. 「摇签吃什么」

### 3.3 备案流程
- ICP 备案：个人约 11-18 天
- 建议开发完成后提前提交备案，并行审核

---

## 四、页面架构

### 4.1 页面清单

```
pages/
├── index/        # 首页 —— 抽签筒（核心交互页）
├── manage/       # 菜品管理 —— 卡片列表增删改
├── history/      # 历史记录 —— 时间线列表
└── add-dish/     # 添加菜品 —— 图片+名称+标签
```

### 4.2 首页 (index) — 详细设计

**布局**：一屏极简
```
┌──────────────────────────┐
│                          │
│       ☁️ 中午吃什么       │  ← 标题
│                          │
│      ┌───────────┐       │
│      │           │       │
│      │   🎋      │       │  ← 签筒主体区域
│      │  抽签筒   │       │     (CSS动画区域)
│      │           │       │
│      │  摇一摇   │       │
│      │  或点击   │       │
│      └───────────┘       │
│                          │
│   [标签筛选] [菜品管理]   │  ← 底部操作栏
│                          │
└──────────────────────────┘
```

**状态机**：
```
IDLE ──(摇动/点击)──> SHAKING ──(动画结束)──> RESULT
                                            │
                              ┌─[就它了]──> CONFIRMED → IDLE
                              │
                              └─[再来一次]─> SHAKING
```

**交互细节**：
- 物理摇手机触发（`wx.onAccelerometerChange`，阈值 > 1.5g）
- 也支持点击签筒触发（备选方案，避免传感器不可用）
- 摇动时签筒 CSS 动画（上下抖动 + 签条飞出）
- 抽中后：大图展示菜品图片 + 菜名 + 标签
- 两个按钮：「就它了！」（确认 + 记入历史）、「再摇一次」

**标签筛选浮层**：
- 底部弹出 picker 或半屏面板
- 三组预设标签，支持多选
- 口味：🌶️辣 / 🥬不辣 / 🌤️微辣 / 🍬酸甜
- 类型：🍚米饭 / 🍜面食 / 🍝粉类 / 🍢小吃 / 🍔快餐 / 📦其他
- 菜系：🥡中餐 / 🍕西餐 / 🍣日料 / 🥩韩料 / 🍛东南亚 / 📦其他
- 筛选后仅从符合条件的菜品中随机
- 重置按钮恢复全部

### 4.3 菜品管理页 (manage)

**布局**：卡片列表
```
┌──────────────────────────┐
│  我的菜单        [+ 添加] │  ← 顶部栏
├──────────────────────────┤
│ ┌──────┐                │
│ │ 图片 │ 黄焖鸡米饭      │  ← 菜品卡片
│ │      │ 🍚米饭 🌶️辣    │     左滑露出删除
│ └──────┘                │
│ ┌──────┐                │
│ │ 图片 │ 番茄鸡蛋面      │
│ │      │ 🍜面食 🥬不辣   │
│ └──────┘                │
│          ...            │
└──────────────────────────┘
```

**功能**：
- 卡片展示：云存储缩略图 + 菜名 + 标签
- 左滑删除：弹出确认弹窗「确定删除【xxx】吗？」，确认后同步删除云存储图片和数据库记录
- 点击编辑：进入编辑模式，可修改名称和标签
- 空状态：「还没有菜品，点击右上角添加吧」
- 单菜品提示：「只有一道菜，快去多加点吧」
- 图片懒加载：`wx.createIntersectionObserver` 控制可视区域加载

### 4.4 添加/编辑菜品页 (add-dish)

**布局**：
```
┌──────────────────────────┐
│  添加菜品 / 编辑菜品      │
├──────────────────────────┤
│                          │
│    ┌────────────────┐    │
│    │   📷 点击上传   │    │  ← 图片上传区
│    │   菜品图片      │    │     1:1 裁剪引导
│    └────────────────┘    │
│                          │
│   菜名：[____________]   │  ← 文本输入
│                          │
│   口味：○辣 ○不辣 ○微辣 ○酸甜 │
│   类型：○米饭 ○面食 ○粉类 ○小吃 ○快餐 ○其他 │
│   菜系：○中餐 ○西餐 ○日料 ○韩料 ○东南亚 ○其他 │
│                          │
│   [      保  存      ]   │
└──────────────────────────┘
```

**上传流程**：
1. `wx.chooseImage({ sizeType: ['compressed'] })` → 微信自动压缩
2. 前端 `wx.compressImage({ quality: 70 })` → 二次压缩
3. 云函数调用 `security.imgSecCheck` → 内容安全审核
4. 审核通过 → `wx.cloud.uploadFile` → 云存储 `dishes/{openid}/{timestamp}.jpg`
5. 获取 `cloudID` → 写入云数据库
6. 审核不通过 → 提示用户重新上传

### 4.5 历史记录页 (history)

**布局**：时间线列表
```
┌──────────────────────────┐
│  历史记录                │
├──────────────────────────┤
│  5月12日 周一            │
│  ┌──────┐               │
│  │ 图片 │ 黄焖鸡米饭     │
│  └──────┘ 🍚 🌶️        │
│                         │
│  5月11日 周日            │
│  ┌──────┐               │
│  │ 图片 │ 番茄鸡蛋面     │
│  └──────┘ 🍜 🥬        │
│          ...            │
└──────────────────────────┘
```

**功能**：
- 按日期分组显示
- 显示菜品缩略图 + 名称 + 标签
- 分页加载（每次20条）
- 空状态：「还没有抽签记录，去摇一签吧」
- **预置示例**：首次启动在云数据库中自动创建 8 道示例菜品（黄焖鸡米饭、麻辣烫、番茄鸡蛋面、宫保鸡丁盖饭、兰州拉面、寿司拼盘、汉堡套餐、酸辣粉），配云端占位图。用户可直接体验摇签，后续可删除或替换。

---

## 五、数据模型

### 5.1 云数据库集合

#### `dishes` — 菜品表
```typescript
interface Dish {
  _id: string;              // 自动生成
  _openid: string;          // 用户openid（云数据库自动管理）
  name: string;             // 菜名，最长20字
  imageCloudId: string;     // 云存储文件ID，格式 cloud://xxx
  tags: {
    taste: 'spicy' | 'not_spicy' | 'mild_spicy' | 'sweet_sour';
    type: 'rice' | 'noodle' | 'vermicelli' | 'snack' | 'fast_food' | 'other';
    cuisine: 'chinese' | 'western' | 'japanese' | 'korean' | 'southeast_asian' | 'other';
  };
  createTime: Date;
  updateTime: Date;
}
```

**权限**：仅创建者可读写（云数据库默认权限）

#### `history` — 历史记录表
```typescript
interface HistoryRecord {
  _id: string;
  _openid: string;
  dishId: string;           // 关联菜品ID
  dishName: string;         // 冗余菜名（防止菜品删除后历史为空）
  dishImage: string;        // 冗余图片
  tags: Dish['tags'];       // 冗余标签
  resultTime: Date;         // 抽中时间
}
```

**权限**：仅创建者可读写，按 `resultTime` 降序查询

### 5.2 云存储目录结构
```
cloud://xxx/
├── dishes/
│   ├── {openid}/
│   │   ├── 1715500000000_a1b2c3.jpg    # 时间戳_随机串.jpg
│   │   └── 1715500001234_d4e5f6.jpg
```

---

## 六、核心技术实现

### 6.1 加速度计（摇一摇）

```typescript
// 关键参数
const SHAKE_THRESHOLD = 1.5;    // 加速度阈值(g)，高于此值触发
const SHAKE_COOLDOWN = 3000;    // 冷却时间(ms)，防止重复触发
const ACC_INTERVAL = 'game';    // 采样频率：game=20ms, ui=60ms

// 调用方式
wx.startAccelerometer({ interval: ACC_INTERVAL });
wx.onAccelerometerChange((res) => {
  const acc = Math.sqrt(res.x ** 2 + res.y ** 2 + res.z ** 2);
  if (acc > SHAKE_THRESHOLD && Date.now() - lastShake > SHAKE_COOLDOWN) {
    lastShake = Date.now();
    triggerLottery();
  }
});
```

**隐私合规**：小程序后台「用户隐私保护指引」中必须声明「调用你的加速传感器」。加速度计不需要用户授权弹窗。

### 6.2 CSS 抽签动画

```css
/* 签筒摇晃 */
@keyframes shakeBox {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

/* 签条飞出 */
@keyframes stickFlyOut {
  0% { transform: translateY(0) rotate(0); opacity: 1; }
  100% { transform: translateY(-300rpx) rotate(20deg); opacity: 0; }
}

/* 结果弹出 */
@keyframes resultPop {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

动画流程（总时长约 2 秒）：
1. 0-0.8s：签筒 `shakeBox` 动画 3 次往复
2. 0.6-1.0s：签条 `stickFlyOut` 飞出
3. 1.0-1.5s：菜品名快速轮播（JS 控制文本切换，配合闪烁效果）
4. 1.5-2.0s：轮播减速，最终定格
5. 2.0s：结果 `resultPop` 弹出

### 6.3 音效 + 震动

```typescript
// 音效预加载（app.ts）
const audioCtx = wx.createInnerAudioContext();
audioCtx.src = '/assets/audio/shake.mp3';    // 摇签音效
audioCtx.autoplay = false;

// 触发时
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.src = '/assets/audio/shake.mp3';
innerAudioContext.play();

// 结果确认时
wx.vibrateShort({ type: 'medium' });  // 震动反馈
```

**iOS 音频限制**：微信小程序 innerAudioContext 在 iOS 上需要用户手势触发才能播放，摇一摇（加速度计回调）不算用户手势。**解决方案**：
- 使用 `wx.vibrateShort` 作为主要反馈（不受限制）
- 音效作为「锦上添花」，在首次用户点击（如点击签筒、按钮）时先播放一次静音音频解锁 AudioContext
- 备选：使用 `wx.createVideoContext` 的音频能力绕过限制

**包体积控制**：音效文件需控制在 200KB 以内（主包总上限 2MB），使用短循环的 mp3 格式，采样率 22050Hz。

### 6.4 图片处理

```
用户选择图片
    │
    ▼
wx.chooseImage({ sizeType: ['compressed'] })  ← 微信自动压缩
    │
    ▼
wx.compressImage({ quality: 70 })              ← 前端二次压缩，目标 < 500KB
    │
    ▼
云函数调用 security.imgSecCheck                 ← 内容安全审核
    │
    ├─ 通过 → wx.cloud.uploadFile() → 云存储 → 写入数据库
    │
    └─ 不通过 → 提示"图片不合规，请重新上传"
```

**删除菜品时同步清理图片**：
```typescript
async function deleteDish(dishId: string, cloudId: string) {
  await wx.cloud.deleteFile({ fileList: [cloudId] });  // 先删图片
  await db.collection('dishes').doc(dishId).remove();  // 再删记录
}
```

### 6.5 云函数 — 图片安全审核

```typescript
// cloud/functions/imgCheck/index.ts
export async function main(event: { fileID: string }) {
  const res = await cloud.downloadFile({ fileID: event.fileID });
  const buffer = res.fileContent;
  
  const checkRes = await cloud.openapi.security.imgSecCheck({
    media: {
      contentType: 'image/jpeg',
      value: buffer,
    },
  });
  
  return { passed: checkRes.errCode === 0 };
}
```

**注意**：`security.imgSecCheck` 对图片大小有要求（< 1MB），前端压缩后必须控制在此范围。

### 6.6 分享

```typescript
// 首页 page.js
Page({
  onShareAppMessage() {
    return {
      title: '摇一摇，决定今天中午吃什么！',
      path: '/pages/index/index',
      imageUrl: '/assets/share-cover.jpg',  // 分享封面 5:4
    };
  },
  
  // 抽中结果后的分享
  onShareResult(dish: Dish) {
    return {
      title: `今天中午吃【${dish.name}】！你也来摇一签？`,
      path: '/pages/index/index',
      imageUrl: dish.imageCloudId,  // 用菜品图做分享封面
    };
  },
});
```

---

## 七、边界情况处理

| 场景 | 处理策略 |
|------|---------|
| 菜品库为空（预置被删光后） | 显示引导蒙层「先添加你的菜单」，指引进入添加页 |
| 只有1道菜 | 可以摇，但 toast 提示「只有一道菜，快去多加点吧」 |
| 标签筛选后无结果 | 提示「符合条件菜品为空，请调整筛选条件」 |
| 重复菜名 | **允许**，不去重。用户可能故意加多次来增加权重 |
| 图片加载失败 | 显示预设占位图（一碗米饭icon） |
| 断网/弱网 | 云数据库操作失败时 toast 提示，本地缓存已加载的菜品列表 |
| 加速度计不可用 | 降级到按钮点击触发（模拟器调试时常见） |
| iOS 音效无法自动播放 | 降级为纯震动反馈 |
| 云存储达到5GB上限 | 提示用户清理不常用的菜品，或升级付费方案 |
| 用户换手机 | 数据在云数据库，新手机直接同步 |
| 微信清缓存 | 云数据库数据不受影响，图片需重新下载（自动） |

---

## 八、开发计划

### Phase 1 — MVP（预计 5-7 天）

| 任务 | 产出 | 估时 |
|------|------|------|
| 项目初始化 | 微信开发者工具项目、云开发环境、Git 仓库 | 0.5天 |
| 数据模型 + 云数据库 | dishes/history 集合、权限配置 | 0.5天 |
| 首页 UI + 摇签动效 | 签筒 CSS 动画、轮播定格、结果展示 | 1.5天 |
| 加速度计集成 | 摇一摇触发 + 冷却机制 + 降级点击 | 0.5天 |
| 添加菜品页 | 图片上传压缩、标签选择、云存储 | 1天 |
| 菜品管理页 | 卡片列表、左滑删除、同步清理 | 1天 |
| 历史记录页 | 时间线列表、分页加载 | 0.5天 |
| 云函数（图片审核） | imgCheck 云函数 | 0.5天 |
| 音效 + 震动 | 音效资源、播放逻辑、iOS 兼容 | 0.5天 |
| 分享功能 | onShareAppMessage | 0.5天 |

### Phase 2 — 增强（后续迭代）

- 标签筛选浮层（首页）
- 新用户引导蒙层动画
- 结果海报生成（Canvas）
- 菜品数据统计（最常吃、最久没吃）
- 暗黑模式

---

## 九、风险清单

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 个人主体审核被拒（功能太简单） | 🔴 高 | 确保 3 页以上功能闭环，录制完整操作视频作为审核材料 |
| 图片内容安全违规导致下架 | 🔴 高 | 必须接入云函数图片审核，每一张上传图片都过审 |
| iOS 音效自动播放被禁 | 🟡 中 | 震动反馈作为主要反馈，音效弱化为次要 |
| 云存储成本超出免费额度 | 🟡 中 | 前端强压缩图片（< 500KB），引导用户清理，设置存储告警 |
| 小程序名称被占用 | 🟡 中 | 准备 3-4 个备选名称，提前搜索确认 |
| 加速度计部分安卓机型兼容 | 🟢 低 | 始终保留点击按钮降级方案 |
| 微信 API 废弃/变更 | 🟢 低 | 使用文档最新版本 API，关注开发者社区公告 |

---

## 十、已确认决策

| 决策项 | 结论 |
|--------|------|
| iOS 音效降级 | **接受降级**：iOS 仅震动反馈，Android 正常音效+震动 |
| 新用户引导 | **预置 8 道示例菜品**（黄焖鸡、麻辣烫、番茄鸡蛋面等），配占位图，用户可删除 |
| 删除确认 | **需要二次确认弹窗**：标题「确定删除【xxx】吗？」，确认后执行 |
| 标签方案 | **三组固定标签**：口味(辣/不辣/微辣/酸甜) + 类型(米饭/面食/粉类/小吃/快餐/其他) + 菜系(中餐/西餐/日料/韩料/东南亚/其他) |
| 小程序名称 | 待微信公众平台注册时搜索确认，首选「中午吃什么」 |
