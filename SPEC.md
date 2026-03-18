# iPassBox - 技术规范文档

## 1. 项目概述

### 项目名称
iPassBox - 本地密码管理器

### 项目类型
跨平台桌面应用程序 (Windows/macOS/Linux)

### 核心功能摘要
一个本地加密存储的密码管理应用，采用AES-256加密保护数据，支持密码生成、分类管理、搜索和自动锁定功能。

### 目标用户
- 需要安全管理多个网站/应用账号密码的个人用户
- 注重隐私，不希望密码数据存储在云端的用户

---

## 2. UI/UX 规范

### 2.1 窗口模型

#### 主窗口
- 尺寸: 1000x700 像素 (最小尺寸: 800x600)
- 可调整大小: 是
- 居中显示: 是

#### 对话框
- 添加/编辑密码对话框: 模态窗口, 500x550 像素
- 设置对话框: 模态窗口, 450x400 像素
- 密码生成器对话框: 模态窗口, 400x350 像素
- 备份/恢复对话框: 模态窗口, 450x300 像素

### 2.2 视觉设计

#### 配色方案
- 主色 (Primary): #2563EB (蓝色)
- 主色悬停: #1D4ED8
- 次色 (Secondary): #64748B (灰蓝色)
- 强调色 (Accent): #10B981 (绿色 - 用于成功状态)
- 警告色: #F59E0B (橙色)
- 危险色: #EF4444 (红色)
- 背景色: #F8FAFC (浅灰白)
- 卡片背景: #FFFFFF
- 文字主色: #1E293B
- 文字次色: #64748B
- 边框色: #E2E8F0

#### 字体
- 主字体: "Segoe UI", "SF Pro Display", "Ubuntu", system-ui, sans-serif
- 等宽字体 (密码): "Cascadia Code", "SF Mono", "Consolas", monospace
- 标题大小: 24px / 20px / 16px (h1/h2/h3)
- 正文大小: 14px
- 小字: 12px

#### 间距系统
- 基础单位: 4px
- 组件间距: 16px
- 卡片内边距: 20px
- 列表项间距: 8px

#### 视觉效果
- 卡片阴影: 0 1px 3px rgba(0,0,0,0.1)
- 悬停阴影: 0 4px 6px rgba(0,0,0,0.1)
- 圆角: 8px (卡片), 6px (按钮), 4px (输入框)
- 过渡动画: 150ms ease-in-out

### 2.3 组件规范

#### 按钮
- 主按钮: 背景 #2563EB, 文字 #FFFFFF, 高度 40px
- 次按钮: 背景透明, 边框 #E2E8F0, 文字 #64748B
- 危险按钮: 背景 #EF4444, 文字 #FFFFFF
- 禁用状态: 透明度 0.5, 不可点击
- 悬停状态: 亮度增加 10%

#### 输入框
- 高度: 40px
- 边框: 1px solid #E2E8F0
- 聚焦边框: 2px solid #2563EB
- 密码字段: 显示切换按钮

#### 列表项
- 高度: 64px
- 悬停背景: #F1F5F9
- 选中背景: #EFF6FF
- 显示图标、标题、用户名、类别标签

#### 密码强度指示器
- 弱 (0-25): #EF4444 红色
- 中 (26-50): #F59E0B 橙色
- 良 (51-75): #3B82F6 蓝色
- 强 (76-100): #10B981 绿色

---

## 3. 功能规范

### 3.1 核心功能

#### 主密码系统
- 首次启动时设置主密码 (至少8位)
- 每次启动时验证主密码
- 主密码使用PBKDF2+SHA256进行密钥派生
- 错误锁定: 连续5次错误后锁定1分钟

#### 自动锁定
- 闲置超时: 默认5分钟 (可配置: 1/5/10/30分钟)
- 手动锁定按钮
- 锁定后需重新输入主密码

#### 密码存储
- 字段: ID, 网站/应用名称, URL, 用户名, 密码, 备注, 类别, 创建时间, 更新时间
- 类别预设: 社交媒体, 邮箱, 银行, 购物, 工作, 娱乐, 其他
- 自定义类别支持

#### 密码操作
- 添加密码: 完整字段录入
- 编辑密码: 修改任意字段
- 删除密码: 确认对话框
- 查看密码: 点击显示/复制按钮
- 搜索: 实时搜索 (名称/URL/用户名)
- 分类筛选: 按类别过滤

#### 密码生成器
- 长度: 8-64位 (默认16)
- 字符类型:
  - 大写字母 (A-Z)
  - 小写字母 (a-z)
  - 数字 (0-9)
  - 特殊字符 (!@#$%^&*...)
- 排除相似字符: 0, O, l, 1, I
- 实时密码强度检测
- 一键复制

#### 数据备份与恢复
- 导出格式: 加密的JSON文件 (.vault)
- 导入: 支持 .vault 文件恢复
- 导出时需要确认主密码

### 3.2 数据流

```
用户输入 → 主密码验证 → 密钥派生 (PBKDF2) → AES-256加密/解密 → SQLite存储
```

### 3.3 模块设计

#### AuthModule
- `set_master_password(password: str)` - 设置主密码
- `verify_master_password(password: str) -> bool` - 验证主密码
- `derive_key(password: str) -> bytes` - 密钥派生

#### CryptoModule
- `encrypt(data: str, key: bytes) -> str` - AES-256加密
- `decrypt(encrypted: str, key: bytes) -> str` - AES-256解密

#### DatabaseModule
- `init_db()` - 初始化数据库
- `add_entry(entry: PasswordEntry)` - 添加密码
- `update_entry(entry: PasswordEntry)` - 更新密码
- `delete_entry(id: str)` - 删除密码
- `search_entries(query: str)` - 搜索密码
- `get_entries_by_category(category: str)` - 按类别筛选
- `get_all_entries()` - 获取所有密码

#### PasswordGeneratorModule
- `generate(options: GenOptions) -> str` - 生成密码
- `calculate_strength(password: str) -> int` - 计算强度

#### BackupModule
- `export_data(filepath: str)` - 导出数据
- `import_data(filepath: str)` - 导入数据

---

## 4. 技术实现

### 技术栈
- 框架: Electron + React + TypeScript
- 数据库: SQLite (better-sqlite3)
- 加密: crypto (Node.js built-in)
- 状态管理: React Context + useReducer
- 样式: CSS Modules

### 安全措施
- 主密码不存储, 仅存储验证哈希
- 加密密钥从主密码派生, 不持久化
- 内存中的敏感数据及时清理
- 自动锁定时清除内存中的密钥

---

## 5. 验收标准

### 功能验收
- [ ] 主密码设置和验证正常工作
- [ ] 可以添加、编辑、删除密码条目
- [ ] 搜索和分类筛选功能正常
- [ ] 密码生成器生成符合要求的密码
- [ ] 自动锁定在闲置超时后触发
- [ ] 数据可以成功备份和恢复
- [ ] 密码以加密形式存储在数据库中

### 视觉验收
- [ ] 界面符合配色方案规范
- [ ] 组件状态 (悬停、禁用、选中) 正确显示
- [ ] 密码强度指示器颜色正确
- [ ] 响应式布局正常

### 安全验收
- [ ] 未授权无法访问数据
- [ ] 数据库中的密码字段已加密
- [ ] 锁定后需要重新验证主密码

---

## 6. 文件结构

```
iPassBox/
├── src/
│   ├── main/           # Electron主进程
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── modules/
│   │       ├── auth.ts
│   │       ├── crypto.ts
│   │       ├── database.ts
│   │       ├── generator.ts
│   │       └── backup.ts
│   ├── renderer/       # React渲染进程
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── styles/
│   └── shared/         # 共享类型
│       └── types.ts
├── package.json
├── electron-builder.json
├── tsconfig.json
└── SPEC.md
```
