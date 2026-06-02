# Zepp Pet Universe Phase 0 — 真机验收交接文档

## 项目简介

我们正在做一款 Amazfit 手表的**电子宠物表盘**（Zepp Pet Universe）。用户抬腕时表盘上会显示一只像素小猫，走路积攒步数可以兑换食物、喂养宠物、解锁进化形态。

目前代码和素材都已就绪，但**所有代码都未经真机验证**。我们需要你在实机上跑一轮验收，确认 Zepp OS 的 API 在真机上是否按预期工作。

---

## 你需要的东西

- [ ] **1 块圆屏手表**（Amazfit GTR 系列，Zepp OS >= 3.0）
- [ ] **1 块方屏手表**（Amazfit GTS 系列，Zepp OS >= 3.0）
- [ ] **Windows 电脑**，已安装 Node.js（**v18 或 v20，不要用 v24**）、Zeus CLI、Zepp App（开发者模式）
- [ ] 两块手表都充好电（>= 80%），已配对到手机 Zepp App
- [ ] **用 cmd 或 PowerShell 执行命令，不要用 git-bash**

如果没有方屏或圆屏，只测一块也行，但务必注明是哪块。

---

## 总耗时

约 **2 小时**（纯手工操作），其中 24 小时续航对比可以睡前设置、第二天看结果。

---

## 你具体要做什么（4 步）

### 第 1 步：检出代码

```powershell
git clone <仓库地址> D:\huami\desktop_pet
cd D:\huami\desktop_pet
git checkout feat/pet-universe-phase-0
```

### 第 2 步：安装两个应用到手表

**应用 A — 配套小程序（Mini Program）**
```powershell
cd D:\huami\desktop_pet\device-app
zeus preview
```
终端会显示一个二维码 → 手机 Zepp App → 开发者模式 → 扫二维码安装。
安装后手表应用列表会出现 **"Pet Universe Spike"**，打开应看到 PET UNIVERSE 标题和步数。

**应用 B — 表盘（Watch Face）**
```powershell
cd D:\huami\desktop_pet\watchface-spike
zeus preview
```
同样扫二维码安装。然后在手表设置 > 表盘中切换为 **"Pet Universe Face Spike"**。

> **如果 `zeus preview` / `zeus build` 报错 `ERR_INVALID_ARG_TYPE`：**
> 这是 Zeus CLI 的 zpm 库不兼容 Node.js v24 的已知问题。降级到 Node.js 18 或 20 即可。

### 第 3 步：逐项验收（每块手表约 30 分钟）

结果填在 `docs/validation/phase-0-device-spike.md` 里。

| # | 验收项 | 怎么测 | 通过标准 |
|---|--------|--------|----------|
| 1 | **STEP 步数读数** | 戴上表走几步 | 表盘上显示 "XXXX STEPS" 且数字会变化 |
| 2 | **抬腕动画** | 息屏 → 抬腕 | 宠物区域播放约 1 秒动画后停住 |
| 3 | **动画后静态帧** | 等动画播完，再等 30 秒 | 表盘上宠物一直可见，不会消失 |
| 4 | **点触宠物** | 在表盘上点宠物区域 | 动画再次播放（注：此功能可能不支持，不支持的话记下即可） |
| 5 | **AOD 息屏显示** | 盖住屏幕进入 AOD 模式 | AOD 显示静态灰色轮廓，无动画 |
| 6 | **数据持久化** | 打开小程序 → 记下食物数 → 关闭 → 重新打开 | 食物数字不变 |
| 7 | **跨应用共享** | 看表盘和小程序能否共享数据 | 预期是不能，确认一下即可 |

每项记录格式示例：
```
Round:  pass  | 显示 5243 STEPS，走了几步后变成 5251
Square: pass  | 同上
```

### 第 4 步：记录关键测量值

```powershell
cd D:\huami\desktop_pet
npm run measure:assets
```
这个会输出宠物素材包的大小。填到 `phase-0-device-spike.md` 的测量表里。

**24 小时续航对比（可选但很有价值）：**
1. 手表充满电，用系统默认表盘，记录电量 % 和时间
2. 24 小时后再次记录电量 %
3. 再次充满电，换上 "Pet Universe Face Spike"
4. 24 小时后记录电量 %

两次的 **AOD 和抬腕唤醒设置必须一致**。

---

## 做完之后

1. 确认 `docs/validation/phase-0-device-spike.md` 所有表格已填完
2. **勾选回退方案复选框**（第 36-39 行附近）：
   - 如果点触不工作 → 勾选 "Tap interaction moves to the companion Mini Program"
   - 数据无法共享 → 勾选 "Selected-pet watch-face variants are required for V1"
3. **做出 Go / No-Go 决策**（文档末尾）
4. 提交结果：
```powershell
git add docs/validation/phase-0-device-spike.md
git commit -m "docs: record physical device gate results"
git push
```
5. 通知我（或提交 PR）

---

## 如果卡住了

| 现象 | 可能原因 | 解决办法 |
|------|----------|----------|
| `zeus build` 报 `ERR_INVALID_ARG_TYPE` | Node.js v24 不兼容 | 装 Node.js 18/20，用 `nvm use 18` 切换 |
| `zeus preview` 说找不到 node | 你在 git-bash 里 | 换成 cmd 或 PowerShell |
| 表盘装上去黑屏 | 素材没 staging | 跑 `node scripts/stage-watchface-assets.mjs pet-packs/pixel-cat watchface-spike/assets` 然后重 build |
| 小程序打开闪退 | 缺少文件或权限不对 | 检查 `device-app/core/` 下 5 个 JS 文件是否存在 |
| **以上都没解决** | — | 直接找我 |

---

## 这些事不用你做

- ❌ 不需要改任何代码
- ❌ 不需要生成或修改图片
- ❌ 不需要写测试
- ❌ 不需要做 Phase 1 的任何事

## 这个验收为什么重要

这是整个项目的**门禁关卡**。只有真机验证通过，我们才能确认：
- Zepp OS 的 STEP 传感器在实机上能读数
- IMG_ANIM 动画能播一次就停
- AOD 模式能显示静态图
- 小程序 LocalStorage 能持久化

如果这些在真机上不工作，整个产品设计就要调整。所以你的验收结果直接决定项目能不能往下走。
