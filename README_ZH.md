# iPassBox - 密码管理器

<div align="center">

[![平台](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/yourusername/iPassBox)
[![许可证](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://react.dev/)

一个安全的本地密码管理应用，采用 AES-256 加密。

[English](./README.md) | [中文](./README_ZH.md)

</div>

---

## 📖 目录

- [功能特点](#-功能特点)
- [界面截图](#-界面截图)
- [安全特性](#-安全特性)
- [快速开始](#-快速开始)
  - [环境要求](#环境要求)
  - [安装部署](#安装部署)
  - [开发运行](#开发运行)
  - [构建打包](#构建打包)
- [使用说明](#-使用说明)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

## ✨ 功能特点

### 核心功能
- **🔐 安全存储** - 使用 AES-256-GCM 加密保护所有密码
- **🎲 密码生成器** - 可自定义选项生成强密码
- **📂 分类管理** - 按类别组织密码（社交、工作、金融、购物、娱乐等）
- **🔍 快速搜索** - 按名称、用户名或网址搜索密码
- **🔄 数据备份/恢复** - 导出和导入密码数据

### 安全特性
- **主密码** - 单个主密码保护所有数据
- **PBKDF2 密钥派生** - 100,000 次迭代确保安全
- **自动锁定** - 可配置闲置超时后自动锁定
- **本地存储** - 所有数据仅存储在本地，不上传云端

### 用户体验
- **🌐 多语言支持** - 支持英文和简体中文
- **📱 跨平台** - 支持 Windows、macOS 和 Linux
- **🎨 简洁界面** - 现代直观的用户界面

---

## 📷 界面截图

| 登录界面 | 主界面 | 密码生成器 |
|:---:|:---:|:---:|
| ![登录](./docs/images/login.png) | ![主界面](./docs/images/main.png) | ![生成器](./docs/images/generator.png) |

---

## 🔒 安全特性

### 加密方式
- **算法**: AES-256-GCM（伽罗瓦计数器模式）
- **密钥派生**: PBKDF2 + SHA-256，100,000 次迭代
- **盐值**: 每次安装随机生成 256 位盐值

### 数据存储
- 数据存储在用户系统数据目录：
  - **Windows**: `%APPDATA%/iPassBox/`
  - **macOS**: `~/Library/Application Support/iPassBox/`
  - **Linux**: `~/.config/iPassBox/`

### 安全最佳实践
- ✅ 主密码不以明文形式存储
- ✅ 所有密码静态加密
- ✅ 数据永不离开您的设备
- ✅ 闲置后自动锁定

---

## 🚀 快速开始

### 环境要求

| 要求 | 版本 |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

### 安装部署

```bash
# 克隆仓库
git clone https://github.com/yourusername/iPassBox.git
cd iPassBox

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 开发运行

```bash
# 开发模式运行
npm run dev

# 生产构建
npm run build
```

### 构建打包

```bash
# 构建应用程序
npm run build

# 构建文件位置：
# - dist/main/   (Electron 主进程)
# - dist/renderer/ (React 前端)
```

---

## 📖 使用说明

### 首次设置

1. 启动应用程序
2. 创建一个强主密码（至少 8 个字符）
3. 开始添加您的密码！

### 添加密码

1. 点击 **"+ 添加"** 按钮
2. 填写详细信息：
   - 名称（必填）
   - 网址（可选）
   - 用户名（可选）
   - 密码（必填）
   - 分类（可选）
   - 备注（可选）
3. 点击 **保存**

### 生成强密码

1. 点击侧边栏中的 **密码生成器**
2. 配置选项：
   - 长度（8-64 个字符）
   - 大写字母 (A-Z)
   - 小写字母 (a-z)
   - 数字 (0-9)
   - 符号 (!@#$%^&*)
3. 点击 **生成**
4. 点击 **使用** 应用到当前表单

### 数据备份

1. 点击侧边栏中的 **导出数据**
2. 选择备份文件保存位置
3. 备份文件使用您的主密码加密

### 切换语言

1. 点击侧边栏中的 **设置**
2. 选择您偏好的语言
3. 界面会立即更新

---

## 🛠 技术栈

| 层级 | 技术 |
|-------|------------|
| 框架 | [Electron](https://www.electronjs.org/) 28.x |
| 前端 | [React](https://react.dev/) 18.x |
| 语言 | [TypeScript](https://www.typescriptlang.org/) 5.x |
| 构建工具 | [Vite](https://vitejs.dev/) 5.x |
| 加密 | Node.js crypto (AES-256-GCM) |
| 日志 | [electron-log](https://github.com/megahertz/electron-log) |

---

## 📁 项目结构

```
iPassBox/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── main.ts           # 入口文件
│   │   ├── preload.ts        # 预加载脚本
│   │   └── modules/
│   │       ├── database.ts   # 数据加密与存储
│   │       └── generator.ts  # 密码生成器
│   ├── renderer/             # React 前端
│   │   ├── App.tsx           # 根组件
│   │   ├── components/       # UI 组件
│   │   ├── pages/            # 页面组件
│   │   ├── context/          # React 上下文
│   │   ├── locales/          # 国际化翻译
│   │   └── styles/           # 样式文件
│   └── shared/               # 共享类型
│       └── types.ts
├── dist/                     # 构建输出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🤝 贡献指南

欢迎贡献代码！请随时提交 Pull Request。

### 开发流程

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目基于 MIT 许可证开源 - 请查看 [LICENSE](LICENSE) 文件了解详情。

---

## ⚠️ 免责声明

- **主密码**：如果您忘记了主密码，将无法恢复数据。请妥善保管！
- **数据备份**：请定期备份密码数据以防止数据丢失。
- **安全提醒**：本应用程序使用强加密，但没有系统是 100% 安全的。请谨慎使用。

---

<div align="center">

**❤️ 安全密码管理，从这里开始**

</div>
