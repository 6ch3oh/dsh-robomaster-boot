# dsh-robomaster-boot

> **RoboMaster 开机动画（官方 Logo 版）** (Official RoboMaster Logo Edition · 官方原版机甲大师横版徽标)  
> 专为 **DeepSeek Harness (`DSH >= 0.2.0-rc.1 / 0.2.0-rc.2`)** 打造的 RoboMaster 机甲大师 × 550C 战术全息开机动画插件。

![RoboMaster 开机动画（官方 Logo 版） 四幕分镜总览](./assets/preview.jpg)

---

## ✨ 核心特性 (Highlights)

1. **零白屏 / 零原生加载卡闪烁 (`webserver/index-inject`)**  
   在文档 `<head>` 解析阶段同步注入首帧黑底琥珀色遮罩，彻底遮蔽 DSH 原生 `HARNESS / Loading plugins…` 启动卡片，并在客户端遮罩挂载的同一微任务无缝交接。
2. **四种开机档位自由切换（位于 `设置 → 通用` 及 `设置 → 550C`）**
   - **关闭 (`off`)**：不播放本插件开机动画。
   - **简易 (`simple` · 2.2 秒)**：仅播放开篇机甲徽标水平红色激光扫描与电调上电音效，随后平滑淡入 DSH。
   - **完整 (`full` · 22 秒 60fps 实时引擎)**：实时运行 HTML5 Canvas 战术终端、红警风格全息机甲雷达投影（涵盖步兵/英雄/工程/无人机高速发弹丸/哨兵/飞镖/雷达 7 大兵种）与 14 个硬核工程软件弹窗（`SolidWorks 2024`、`AutoCAD 2024`、`MATLAB R2023b LQR`、`STM32CubeMX H723`、`立创 EDA Pro`、`Keil MDK-ARM`、`VOFA+`、`RViz2 & chenjunnn/rm_vision EKF` 等），最终双竖线激光拉出 `SYSTEM IS READY`。
   - **超清视频 (`video` · 22 秒 1080P 60fps MP4)**：通过内置 HTTP Range (`206 Partial Content`) 流式播放 1080P 60fps 硬件加速视频。
3. **全窗口自适应缩放 (`1920×1080` → 任意窗口尺寸)**  
   无论 DSH Desktop 处于窗口化、最大化还是高分屏缩放状态，自动保持 16:9 居中无损等比缩放。
4. **双版本与原版 550C 智能互斥 + 一键预览**  
   - 与姊妹版本 [`dsh-hust-langya-boot`](https://github.com/6ch3oh/dsh-hust-langya-boot)（华中科技大学狼牙战队版 (dsh-hust-langya-boot)）以及 `dsh-550c-boot` 自动互斥切换，开启本插件时自动将其他开机动画设为 `关闭`，绝不重叠冲突。
   - 设置面板内置 **「🔊 声音: 开/关」** 与 **「▶ 立即预览」** 按钮；播放途中**点击画面或按 `Esc` 键**即可立即跳过。

---

## 🚀 安装方法 (Installation)

### 方式一：通过 DSH 插件命令 / pnpm 直接从 GitHub 安装（推荐）

在您的 DSH Profile 目录（Windows 默认为 `%USERPROFILE%\.dsh\profiles\desktop` 或 `web`）下执行：

```bash
pnpm add github:6ch3oh/dsh-robomaster-boot
```

并在该 Profile 的 `package.json` 的 `dsh.profile.bundles` 数组中加入 `"dsh-robomaster-boot"`，重启 DSH 即可生效。

### 方式二：下载 Release `.tgz` 离线包安装

前往本仓库 [**Releases 页面**](https://github.com/6ch3oh/dsh-robomaster-boot/releases/latest) 下载 `dsh-robomaster-boot-1.0.0.tgz`（同时提供 51MB 母带级 1080P 60fps 独立 `.mp4` 成片下载）：

```bash
pnpm add ./dsh-robomaster-boot-1.0.0.tgz
```

---

## 🎮 姊妹版本 (Sibling Edition)

- [**`dsh-robomaster-boot`**](https://github.com/6ch3oh/dsh-robomaster-boot)：**RoboMaster 官方 Logo 版**（片头采用大疆 RoboMaster 官方原版机甲大师横版组合徽标激光扫描）
- [**`dsh-hust-langya-boot`**](https://github.com/6ch3oh/dsh-hust-langya-boot)：**华中科技大学狼牙战队 (HUST LANGYA) 定制版**（片头采用定制六边形机甲盾牌狼牙徽标 + `华中科技大学 ◆ 狼牙战队 / HUST LANGYA MECHA DIVISION` 激光扫描）

---

## 📄 License

MIT License © 2026 6ch3oh
