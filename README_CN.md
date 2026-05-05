# SubBili

[English](./README.md) | 中文版

一款极致体验、高性能的 Bilibili 脚本，支持下载 SRT 和 BCC 格式的字幕。采用现代技术栈构建，内置智能诊断系统，轻松应对哔哩哔哩最新的反爬虫限制。

## ✨ 功能特性

- **支持 SRT & BCC**：可将字幕导出为标准的 SRT 格式或 Bilibili 原生的 BCC JSON 格式。
- **毛玻璃设计 UI**：采用现代化的交互界面，与 Bilibili 的设计风格完美融合。
- **智能诊断系统**：内置诊断面板，实时监控网络请求，帮助排查下载失败的原因。
- **番剧支持**：完美支持普通视频和番剧（动画/剧集）页面。
- **防重定向逻辑**：采用高级请求头处理技术，绕过 Bilibili 最新的“基于 Referer”的重定向保护。
- **Vite 驱动**：使用 Vite 和 TypeScript 构建，确保极致的稳定性与性能。

## 🚀 安装方式

1. 首先安装一个用户脚本管理器，例如 [脚本猫 (ScriptCat)](https://docs.scriptcat.org/) 或 [Tampermonkey](https://www.tampermonkey.net/)。
2. 点击 [**安装 SubBili**](https://github.com/ericclose/subbili/releases/latest/download/subbili.user.js)（直接从 GitHub Releases 获取）。
3. 在管理器中确认安装，然后刷新 Bilibili 页面。

## 🛠 技术亮点

### 绕过 Bilibili 防盗链
Bilibili 的资源服务器 (`aisubtitle.hdslb.com`) 实施了严格的策略：如果检测到 Referer 包含特定的视频路径，则会将字幕请求重定向到视频详情页。

本脚本实现了 **域名感知 Referer 策略**：
- **标准 Referer**：对于 `i0.hdslb.com` 等旧域名，使用 `https://www.bilibili.com/` (根域名) 以满足防盗链要求。
- **空 Referer 策略**：对于 `aisubtitle` 域名，动态移除 Referer 请求头，防止触发 302 重定向。
- **签名保护**：避免添加会使 Bilibili URL 签名 (`auth_key`) 失效的缓存清除参数 (`_t`)。

### 技术栈
- **TypeScript**：类型安全的开发环境。
- **Vite**：极速构建工具。
- **vite-plugin-monkey**：无缝集成的用户脚本生成插件。
- **GM_xmlhttpRequest**：用于跨域请求，绕过浏览器的 CSP 和 Referer 限制。

## 💻 开发指南

### 常用命令
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
```

## 🐞 诊断面板
如果下载失败，请点击右下角的 **烧杯图标 (🧪)**。它会显示嗅探和下载过程中的实时日志。你可以使用 **“复制”** 按钮分享诊断报告，以便于排查问题。

## 📜 开源协议
MIT
