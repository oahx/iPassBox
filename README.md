# iPassBox

<div align="center">

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/yourusername/iPassBox)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB)](https://react.dev/)

A secure, local-only password management application with AES-256 encryption.

[English](./README.md) | [中文](./README_ZH.md)

</div>

---

## 📖 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Security](#-security)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development](#development)
  - [Build](#build)
- [Usage](#-usage)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- **🔐 Secure Storage** - AES-256-GCM encryption for all stored passwords
- **🎲 Password Generator** - Generate strong passwords with customizable options
- **📂 Category Management** - Organize passwords by categories (Social, Work, Finance, Shopping, Entertainment, etc.)
- **🔍 Quick Search** - Search passwords by name, username, or URL
- **🔄 Data Backup/Restore** - Export and import password data

### Security Features
- **Master Password** - Single master password protects all your data
- **PBKDF2 Key Derivation** - 100,000 iterations for secure key derivation
- **Auto-Lock** - Automatically lock after configurable idle timeout
- **Local Only** - All data stored locally, never uploaded to cloud

### User Experience
- **🌐 Multi-language Support** - English and Chinese (Simplified)
- **📱 Cross-Platform** - Works on Windows, macOS, and Linux
- **🎨 Clean UI** - Modern and intuitive user interface

---

## 📷 Screenshots

| Login Screen | Main Interface | Password Generator |
|:---:|:---:|:---:|
| ![Login](./docs/images/login.png) | ![Main](./docs/images/main.png) | ![Generator](./docs/images/generator.png) |

---

## 🔒 Security

### Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Salt**: 256-bit random salt per installation

### Data Storage
- Data is stored in the user's system data directory:
  - **Windows**: `%APPDATA%/iPassBox/`
  - **macOS**: `~/Library/Application Support/iPassBox/`
  - **Linux**: `~/.config/iPassBox/`

### Security Best Practices
- ✅ Master password is never stored in plain text
- ✅ All passwords are encrypted at rest
- ✅ Data never leaves your device
- ✅ Automatic lock after inactivity

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/iPassBox.git
cd iPassBox

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build
```

### Build

```bash
# Build the application
npm run build

# The built files will be in:
# - dist/main/   (Electron main process)
# - dist/renderer/ (React frontend)
```

---

## 📖 Usage

### First Time Setup

1. Launch the application
2. Create a strong master password (minimum 8 characters)
3. Start adding your passwords!

### Adding a Password

1. Click the **"+ Add"** button
2. Fill in the details:
   - Name (required)
   - URL (optional)
   - Username (optional)
   - Password (required)
   - Category (optional)
   - Notes (optional)
3. Click **Save**

### Generating a Strong Password

1. Click **Password Generator** in the sidebar
2. Configure options:
   - Length (8-64 characters)
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Symbols (!@#$%^&*)
3. Click **Generate**
4. Click **Use** to apply to current form

### Data Backup

1. Click **Export Data** in the sidebar
2. Choose a location to save the backup file
3. The backup file is encrypted with your master password

### Language Switching

1. Click **Settings** in the sidebar
2. Select your preferred language
3. The interface updates immediately

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | [Electron](https://www.electronjs.org/) 28.x |
| Frontend | [React](https://react.dev/) 18.x |
| Language | [TypeScript](https://www.typescriptlang.org/) 5.x |
| Build Tool | [Vite](https://vitejs.dev/) 5.x |
| Encryption | Node.js crypto (AES-256-GCM) |
| Logging | [electron-log](https://github.com/megahertz/electron-log) |

---

## 📁 Project Structure

```
iPassBox/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Entry point
│   │   ├── preload.ts        # Preload script
│   │   └── modules/
│   │       ├── database.ts   # Data encryption & storage
│   │       └── generator.ts  # Password generator
│   ├── renderer/             # React frontend
│   │   ├── App.tsx           # Root component
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React contexts
│   │   ├── locales/          # i18n translations
│   │   └── styles/           # CSS styles
│   └── shared/               # Shared types
│       └── types.ts
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

- **Master Password**: If you forget your master password, there is no way to recover your data. Please keep it safe!
- **Data Backup**: Regularly backup your password data to prevent data loss.
- **Security**: This application uses strong encryption, but no system is 100% secure. Use responsibly.

---

<div align="center">

**Made with ❤️ for secure password management**

</div>
